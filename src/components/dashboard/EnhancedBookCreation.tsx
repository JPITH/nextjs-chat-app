// src/components/dashboard/EnhancedBookCreation.tsx - Version 2.0
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import { bookTemplates, type BookTemplate } from '@/lib/book-templates'

interface EnhancedBookCreationProps {
  onBookCreated: () => void
}

export function EnhancedBookCreation({ onBookCreated }: EnhancedBookCreationProps) {
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<BookTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customTargetWords, setCustomTargetWords] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleTemplateSelect = (template: BookTemplate) => {
    setSelectedTemplate(template)
    setTitle('')
    setDescription(template.description)
    setCustomTargetWords(template.targetWords)
    setStep('details')
  }

  const handleCreateFromScratch = () => {
    setSelectedTemplate(null)
    setTitle('')
    setDescription('')
    setCustomTargetWords(50000)
    setStep('details')
  }

  const createBook = async () => {
    if (!user || !title.trim()) return
    
    setCreating(true)
    try {
      const newBook = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        genre: selectedTemplate?.genre || 'Autre',
        target_words: customTargetWords || 50000,
      }

      const { data: book, error } = await supabase
        .from('books')
        .insert([newBook])
        .select()
        .single()

      if (error) throw error

      console.log('Livre créé:', book)

      // Si un template est sélectionné, envoyer immédiatement le prompt complet
      if (selectedTemplate) {
        console.log('Envoi du prompt initial du template:', selectedTemplate.name)
        
        // Sauvegarder d'abord le prompt comme message utilisateur
        const initialMessage = {
          book_id: book.id,
          title: 'Message utilisateur',
          content: selectedTemplate.fullPrompt,
        }

        const { data: savedPrompt, error: promptError } = await supabase
          .from('book_chat')
          .insert([initialMessage])
          .select()
          .single()

        if (promptError) {
          console.error('Erreur sauvegarde prompt initial:', promptError)
        } else {
          console.log('Prompt initial sauvegardé:', savedPrompt)
          
          // Déclencher n8n avec le prompt complet
          try {
            console.log('Appel n8n pour le prompt template...')
            const response = await fetch('/api/webhook/n8n', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookId: book.id,
                message: selectedTemplate.fullPrompt,
                userId: user.id,
                templateId: selectedTemplate.id,
                templateName: selectedTemplate.name,
                genre: selectedTemplate.genre,
              }),
            })
            
            const result = await response.json()
            console.log('Réponse n8n pour template:', result)
          } catch (webhookError) {
            console.error('Erreur webhook template:', webhookError)
          }
        }
      }

      onBookCreated()
      setShowModal(false)
      setStep('template')
      setSelectedTemplate(null)
      setTitle('')
      setDescription('')
      setCustomTargetWords(null)
      
      // Rediriger vers le livre créé
      router.push(`/books/${book.id}`)
    } catch (error) {
      console.error('Erreur création livre:', error)
      alert('Erreur lors de la création du livre')
    } finally {
      setCreating(false)
    }
  }

  const resetModal = () => {
    setShowModal(false)
    setStep('template')
    setSelectedTemplate(null)
    setTitle('')
    setDescription('')
    setCustomTargetWords(null)
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
        ✍️ Nouveau livre
      </Button>

      <Modal 
        open={showModal} 
        onClose={resetModal}
        title={step === 'template' ? 'Choisir un assistant spécialisé' : 'Détails de votre livre'}
        className="max-w-2xl"
      >
        <div className="min-h-[500px] max-h-[80vh] overflow-y-auto">
          {step === 'template' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">🤖 Comment ça fonctionne ?</h3>
                <p className="text-sm text-blue-700">
                  Chaque assistant est spécialisé dans un type de livre. Dès que vous créez votre projet, 
                  l'assistant vous envoie un message complet avec toute son expertise pour vous guider étape par étape.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {bookTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300 hover:scale-[1.02]"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{template.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900">{template.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {template.genre}
                            </span>
                            <span className="text-xs text-gray-400">
                              ~{(template.targetWords / 1000).toFixed(0)}k mots
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-xs text-green-600 font-medium">
                              ✨ Assistant expert inclus
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCreateFromScratch}
                >
                  🎨 Créer sans assistant (format libre)
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Pour les auteurs expérimentés qui préfèrent partir de zéro
                </p>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {selectedTemplate && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedTemplate.emoji}</span>
                    <div>
                      <p className="font-medium text-blue-900">
                        Assistant {selectedTemplate.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        Dès la création, cet assistant vous enverra un guide complet pour démarrer votre {selectedTemplate.name.toLowerCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      📋 Structure suggérée par l'assistant :
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {selectedTemplate.suggestedStructure.slice(0, 4).map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 font-bold">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                      {selectedTemplate.suggestedStructure.length > 4 && (
                        <li className="text-gray-400 text-center">... et plus encore</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <Input
                label="Titre de votre livre *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={selectedTemplate ? 
                  `Ex: Mon ${selectedTemplate.name.toLowerCase()}` : 
                  "Le titre de votre livre"
                }
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description ou pitch
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={selectedTemplate ?
                    "L'assistant vous aidera à développer votre idée..." :
                    "De quoi parlera votre livre ?"
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Objectif de mots
                </label>
                <Input
                  type="number"
                  value={customTargetWords || ''}
                  onChange={(e) => setCustomTargetWords(parseInt(e.target.value) || null)}
                  placeholder="50000"
                />
                <p className="text-xs text-gray-500">
                  {customTargetWords && `≈ ${Math.ceil(customTargetWords / 250)} pages`}
                  {selectedTemplate && ` • Recommandé pour ce type: ${selectedTemplate.targetWords.toLocaleString()} mots`}
                </p>
              </div>

              {selectedTemplate && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 text-lg">🚀</span>
                    <div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        Prêt à démarrer avec votre assistant !
                      </p>
                      <p className="text-xs text-green-700">
                        Après création, votre assistant {selectedTemplate.name.toLowerCase()} vous enverra 
                        immédiatement un message détaillé avec toutes les étapes pour réussir votre projet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('template')}
                  className="flex-1"
                >
                  ← Changer d'assistant
                </Button>
                <Button 
                  onClick={createBook}
                  disabled={creating || !title.trim()}
                  className="flex-1"
                >
                  {creating ? 'Création...' : selectedTemplate ? '🚀 Créer avec assistant' : 'Créer mon livre'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

// Composant pour afficher un aperçu du prompt d'un template (optionnel)
export function TemplatePromptPreview({ 
  templateId, 
  onClose 
}: {
  templateId: string
  onClose: () => void
}) {
  const template = bookTemplates.find(t => t.id === templateId)
  if (!template) return null

  return (
    <Modal open={true} onClose={onClose} title={`Aperçu: Assistant ${template.name}`}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{template.emoji}</span>
          <div>
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          <p className="text-xs font-medium text-gray-700 mb-2">
            📝 Message initial que l'assistant vous enverra :
          </p>
          <div className="text-sm text-gray-800 whitespace-pre-line">
            {template.fullPrompt.substring(0, 500)}...
          </div>
        </div>
        
        <div className="text-center">
          <Button onClick={onClose}>Fermer l'aperçu</Button>
        </div>
      </div>
    </Modal>
  )
}