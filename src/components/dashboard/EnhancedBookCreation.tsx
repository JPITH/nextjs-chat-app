// src/components/dashboard/EnhancedBookCreation.tsx - Correction
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
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
      // 1. Créer le livre via l'API
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          genre: selectedTemplate?.genre || 'Autre',
          target_words: customTargetWords || 50000,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création du livre')
      }

      const { book } = await response.json()
      console.log('Livre créé:', book)

      // 2. Si un template est sélectionné, envoyer le prompt via l'API de messages
      if (selectedTemplate) {
        console.log('Envoi du prompt initial du template:', selectedTemplate.name)
        
        try {
          const messageResponse = await fetch(`/api/books/${book.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: selectedTemplate.fullPrompt,
            }),
          })

          if (!messageResponse.ok) {
            console.error('Erreur lors de l\'envoi du prompt initial')
          } else {
            console.log('Prompt initial envoyé avec succès')
          }
        } catch (error) {
          console.error('Erreur envoi prompt:', error)
        }
      }

      // 3. Nettoyer et rediriger
      onBookCreated()
      resetModal()
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