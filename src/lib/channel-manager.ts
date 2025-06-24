// src/lib/channel-manager.ts - Version corrigée avec types appropriés
import { createClient } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

class ChannelManager {
  private static instance: ChannelManager;
  private channels: Map<string, RealtimeChannel> = new Map();
  private supabase = createClient();

  private constructor() {}

  static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  /**
   * Obtient ou crée un channel
   */
  async getOrCreateChannel(
    channelName: string, 
    config?: any
  ): Promise<RealtimeChannel | null> {
    try {
      // Vérifier si le channel existe déjà
      const existingChannel = this.channels.get(channelName);
      if (existingChannel) {
        console.log(`📌 Channel existant trouvé: ${channelName}`);
        
        // Vérifier l'état du channel
        const state = existingChannel.state;
        if (state === 'joined' || state === 'joining') {
          return existingChannel;
        }
        
        // Si le channel est fermé ou en erreur, le supprimer
        console.log(`🧹 Nettoyage du channel en état: ${state}`);
        await this.removeChannel(channelName);
      }

      // Vérifier aussi dans Supabase directement
      const supabaseChannels = this.supabase.getChannels();
      const supabaseChannel = supabaseChannels.find(ch => ch.topic === channelName);
      
      if (supabaseChannel) {
        console.log(`🧹 Channel Supabase existant trouvé, suppression...`);
        await this.supabase.removeChannel(supabaseChannel);
      }

      // Créer un nouveau channel
      console.log(`✨ Création nouveau channel: ${channelName}`);
      const newChannel = this.supabase.channel(channelName, config);
      this.channels.set(channelName, newChannel);
      
      return newChannel;
    } catch (error) {
      console.error(`❌ Erreur création channel ${channelName}:`, error);
      return null;
    }
  }

  /**
   * Supprime un channel
   */
  async removeChannel(channelName: string): Promise<void> {
    try {
      const channel = this.channels.get(channelName);
      
      if (channel) {
        console.log(`🗑️ Suppression channel: ${channelName}`);
        await this.supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
      
      // Vérifier aussi dans Supabase directement
      const supabaseChannels = this.supabase.getChannels();
      const supabaseChannel = supabaseChannels.find(ch => ch.topic === channelName);
      
      if (supabaseChannel) {
        console.log(`🗑️ Suppression channel Supabase: ${channelName}`);
        await this.supabase.removeChannel(supabaseChannel);
      }
    } catch (error) {
      console.error(`❌ Erreur suppression channel ${channelName}:`, error);
    }
  }

  /**
   * Supprime tous les channels
   */
  async removeAllChannels(): Promise<void> {
    console.log('🧹 Suppression de tous les channels...');
    
    // Utiliser Array.from pour éviter l'erreur d'itération
    const channelEntries = Array.from(this.channels.entries());
    for (const [name] of channelEntries) {
      await this.removeChannel(name);
    }
    
    // Nettoyer aussi tous les channels Supabase
    const supabaseChannels = this.supabase.getChannels();
    for (const channel of supabaseChannels) {
      try {
        await this.supabase.removeChannel(channel);
      } catch (error) {
        console.error('Erreur suppression channel Supabase:', error);
      }
    }
  }

  /**
   * Obtient l'état d'un channel
   */
  getChannelState(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  /**
   * Liste tous les channels actifs
   */
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Nettoie les channels inactifs
   */
  async cleanupInactiveChannels(): Promise<void> {
    console.log('🧹 Nettoyage des channels inactifs...');
    
    // Utiliser Array.from pour éviter l'erreur d'itération
    const channelEntries = Array.from(this.channels.entries());
    for (const [name, channel] of channelEntries) {
      if (channel.state === 'closed' || channel.state === 'errored') {
        await this.removeChannel(name);
      }
    }
  }
}

// Hook React pour utiliser le ChannelManager
import { useEffect, useRef, useCallback } from 'react';

export function useSupabaseManagedChannel(
  channelName: string,
  options: {
    onMessage?: (payload: any) => void;
    config?: any;
  } = {}
) {
  const manager = useRef(ChannelManager.getInstance());
  const channelRef = useRef<RealtimeChannel | null>(null);

  const setupChannel = useCallback(async () => {
    if (!channelName) return;

    try {
      // Obtenir ou créer le channel
      const channel = await manager.current.getOrCreateChannel(
        channelName,
        options.config
      );

      if (!channel) {
        console.error('Impossible de créer le channel');
        return;
      }

      channelRef.current = channel;

      // Configurer les écouteurs si nécessaire
      if (options.onMessage) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'book_chat'
          },
          options.onMessage
        );
      }

      // S'abonner au channel
      channel.subscribe((status) => {
        console.log(`📡 Channel ${channelName} status:`, status);
      });

    } catch (error) {
      console.error('Erreur setup channel:', error);
    }
  }, [channelName, options.config, options.onMessage]);

  useEffect(() => {
    setupChannel();

    return () => {
      if (channelName) {
        manager.current.removeChannel(channelName);
      }
    };
  }, [channelName, setupChannel]);

  return {
    channel: channelRef.current,
    manager: manager.current
  };
}

export default ChannelManager;