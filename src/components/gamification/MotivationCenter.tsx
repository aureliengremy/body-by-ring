'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from '@/lib/i18n'
import {
  Heart,
  Bell,
  Trophy,
  Zap,
  Clock,
  Lightbulb,
  X,
  Gift
} from 'lucide-react'

interface MotivationMessage {
  id: string
  type: 'achievement' | 'streak' | 'reminder' | 'motivation' | 'tip'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionButton?: {
    text: string
    action: () => void
  }
}

interface MotivationCenterProps {
  userId: string
}

export function MotivationCenter({ userId }: MotivationCenterProps) {
  const t = useTranslations('motivation')
  const [messages, setMessages] = useState<MotivationMessage[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Simuler des messages de motivation personnalisés
    const mockMessages: MotivationMessage[] = [
      {
        id: '1',
        type: 'streak',
        title: t('seriesInProgress'),
        message: 'Tu es sur une série de 3 jours ! Continue comme ça pour atteindre ton record.',
        timestamp: new Date().toISOString(),
        read: false,
        actionButton: {
          text: t('viewStats'),
          action: () => console.log('Redirection vers statistiques')
        }
      },
      {
        id: '2',
        type: 'motivation',
        title: t('youAreProgressing'),
        message: t('performanceImproving'),
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        read: true
      },
      {
        id: '3',
        type: 'tip',
        title: t('coachTip'),
        message: t('warmupReminder'),
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        read: false
      }
    ]

    setMessages(mockMessages)
  }, [userId, t])

  const getMessageIcon = (type: MotivationMessage['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />
      case 'streak':
        return <Zap className="h-5 w-5 text-orange-600" />
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'motivation':
        return <Heart className="h-5 w-5 text-red-600" />
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-purple-600" />
      default:
        return <Heart className="h-5 w-5 text-gray-600" />
    }
  }

  const getMessageColor = (type: MotivationMessage['type']) => {
    switch (type) {
      case 'achievement':
        return 'border-yellow-200 bg-yellow-50'
      case 'streak':
        return 'border-orange-200 bg-orange-50'
      case 'reminder':
        return 'border-blue-200 bg-blue-50'
      case 'motivation':
        return 'border-red-200 bg-red-50'
      case 'tip':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const markAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    ))
  }

  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
  }

  const unreadCount = messages.filter(msg => !msg.read).length

  return (
    <div className="space-y-4">
      {/* Header avec bouton notifications */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            {t('center')}
          </h2>
          <p className="text-gray-600">
            {t('personalizedMessages')}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative"
        >
          <Bell className="h-4 w-4 mr-2" />
          {t('notifications')}
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Messages de motivation */}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                {t('noNewMessages')}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t('keepTraining')}
              </p>
            </CardContent>
          </Card>
        ) : (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={`transition-all hover:shadow-md ${
                message.read ? 'opacity-75' : ''
              } ${getMessageColor(message.type)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {message.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissMessage(message.id)}
                          className="h-6 w-6 p-0 hover:bg-gray-200"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {message.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        {message.actionButton && (
                          <Button 
                            size="sm" 
                            onClick={message.actionButton.action}
                            className="text-xs"
                          >
                            {message.actionButton.text}
                          </Button>
                        )}
                        
                        {!message.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(message.id)}
                            className="text-xs"
                          >
                            {t('markAsRead')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Conseils quotidiens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            {t('dailyTip')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900 font-medium mb-1">
              {t('trainingTip')}
            </p>
            <p className="text-sm text-purple-700">
              {t('focusOnQuality')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}