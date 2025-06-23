// src/components/dashboard/EnhancedBookCreation.tsx
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

      // Si un template est sélectionné, envoyer le prompt initial
      if (selectedTemplate) {
        const initialMessage = {
          book_id: book.id,
          title: 'Message utilisateur',
          content: selectedTemplate.initialPrompt,
        }

        await supabase
          .from('book_chat')
          .insert([initialMessage])

        // Déclencher n8n avec le contexte du template
        try {
          await fetch('/api/webhook/n8n', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookId: book.id,
              message: selectedTemplate.initialPrompt,
              userId: user.id,
              templateId: selectedTemplate.id,
              genre: selectedTemplate.genre,
            }),
          })
        } catch (webhookError) {
          console.error('Erreur webhook n8n:', webhookError)
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
        title={step === 'template' ? 'Choisir un type de livre' : 'Détails de votre livre'}
      >
        <div className="min-h-[400px]">
          {step === 'template' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Sélectionnez un type de livre pour obtenir une assistance spécialisée, ou partez de zéro.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {bookTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow hover:border-blue-300"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{template.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{template.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {template.genre}
                            </span>
                            <span className="text-xs text-gray-400">
                              ~{(template.targetWords / 1000).toFixed(0)}k mots
                            </span>
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
                  🎨 Créer sans template (format libre)
                </Button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {selectedTemplate && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{selectedTemplate.emoji}</span>
                    <div>
                      <p className="font-medium text-sm text-blue-900">
                        {selectedTemplate.name}
                      </p>
                      <p className="text-xs text-blue-700">
                        Assistant spécialisé activé pour ce genre
                      </p>
                    </div>
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
                    "Décrivez brièvement votre idée..." :
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
                </p>
              </div>

              {selectedTemplate && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Structure suggérée pour ce type de livre :
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {selectedTemplate.suggestedStructure.map((step, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('template')}
                  className="flex-1"
                >
                  ← Retour
                </Button>
                <Button 
                  onClick={createBook}
                  disabled={creating || !title.trim()}
                  className="flex-1"
                >
                  {creating ? 'Création...' : 'Créer mon livre'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

// Composant pour afficher les suggestions contextuelles dans le chat
export function ContextualSuggestions({ 
  templateId, 
  wordCount, 
  onSuggestionClick 
}: {
  templateId?: string
  wordCount: number
  onSuggestionClick: (suggestion: string) => void
}) {
  if (!templateId) return null

  const template = bookTemplates.find(t => t.id === templateId)
  if (!template) return null

  const progress = wordCount / template.targetWords
  let suggestions: string[] = []

  if (progress < 0.1) {
    suggestions = [
      "Aide-moi à développer mes personnages principaux",
      "Comment structurer mon récit ?",
      "Quels sont les éléments clés de ce genre ?"
    ]
  } else if (progress < 0.5) {
    suggestions = [
      "Comment approfondir l'intrigue ?",
      "Aide-moi à créer plus de tension",
      "Quels obstacles ajouter pour mes personnages ?"
    ]
  } else if (progress < 0.8) {
    suggestions = [
      "Comment préparer le climax ?",
      "Aide-moi à nouer les fils de l'intrigue",
      "Comment intensifier l'émotion ?"
    ]
  } else {
    suggestions = [
      "Comment bien conclure mon livre ?",
      "Aide-moi à réviser les passages clés",
      "Quels derniers détails vérifier ?"
    ]
  }

  return (
    <div className="p-4 bg-gray-50 border-t">
      <p className="text-sm font-medium text-gray-700 mb-2">
        💡 Suggestions pour votre {template.name.toLowerCase()} :
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}