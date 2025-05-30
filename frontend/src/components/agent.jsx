"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Bot, User, Send, Loader2, AlertCircle, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AIExplainabilityAgent({ jobId, applicationId, className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: "/api/ai/agent",
    body: {
      jobId,
      applicationId,
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your recruitment assistant. I can help explain candidate selections, compare applicants, or answer questions about the recruitment data. What would you like to know?",
      },
    ],
    onResponse: async (response) => {
      // Handle both streaming and non-streaming responses
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }
        // Add the non-streamed message directly
        setMessages((messages) => [
          ...messages,
          {
            id: Math.random().toString(36).substr(2, 9),
            role: data.role,
            content: data.content,
          },
        ])
        return undefined // Prevent default handling
      }
      
      // Create a clone of the response to avoid the ReadableStream locked error
      const clonedResponse = response.clone()
      return clonedResponse
    },
    onError: (error) => {
      console.error('Chat error:', error)
    },
  })

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }
    scrollToBottom()
  }, [messages])

  // Example queries to help users get started
  const exampleQueries = [
    "Why was this candidate selected?",
    "Compare the top 3 candidates",
    "What skills does this candidate have?",
    "Which candidate has the most experience?",
    "Explain the AI scoring system",
  ]

  const handleExampleClick = (query) => {
    const fakeEvent = {
      target: { value: query }
    }
    handleInputChange(fakeEvent)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Card className={cn("border shadow-md", className, isExpanded ? "fixed inset-4 z-50 flex flex-col" : "")}>
      <CardHeader className="bg-muted/50 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary/10">
              <AvatarFallback className="text-primary">
                <Bot size={16} />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">AI Recruitment Assistant</CardTitle>
              <CardDescription className="text-xs">
                Ask questions about candidates and selection decisions
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="4 14 10 14 10 20"></polyline>
                        <polyline points="20 10 14 10 14 4"></polyline>
                        <line x1="14" y1="10" x2="21" y2="3"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                        <line x1="21" y1="3" x2="14" y2="10"></line>
                        <line x1="3" y1="21" x2="10" y2="14"></line>
                      </svg>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? "Minimize" : "Expand"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px]">
                  <p>
                    This AI assistant analyzes candidate data to explain recruitment decisions and answer your questions
                    about applicants.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("p-0 overflow-hidden", isExpanded ? "flex-1" : "h-[320px]")}>
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex items-start gap-3 text-sm", message.role === "user" ? "justify-end" : "")}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-0.5 bg-primary/10">
                  <AvatarFallback className="text-primary">
                    <Bot size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 mt-0.5 bg-muted">
                  <AvatarFallback>
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 text-sm">
              <Avatar className="h-8 w-8 mt-0.5 bg-primary/10">
                <AvatarFallback className="text-primary">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          {error && (
            // <div className="flex items-start gap-3 text-sm">
            //   <Avatar className="h-8 w-8 mt-0.5 bg-destructive/10">
            //     {/* <AvatarFallback className="text-destructive">
            //       <AlertCircle size={16} />
            //     </AvatarFallback> */}
            //   </Avatar>
            //   {/* <div className="rounded-lg px-3 py-2 bg-destructive/10 text-destructive">
            //     Error: {error.message || "Something went wrong. Please try again."}
            //   </div> */}
            // </div>
            <>
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t p-3 bg-muted/30">
        {messages.length === 1 && (
          <div className="w-full mb-3 flex flex-wrap gap-2">
            {exampleQueries.map((query, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => handleExampleClick(query)}
              >
                {query}
              </Badge>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="w-full flex gap-2">
          <Textarea
            placeholder="Ask about candidates or selection decisions..."
            className="min-h-[40px] resize-none"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send size={16} />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}