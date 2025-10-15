'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HelpCircle,
  MessageSquare,
  Users,
  Wrench,
  Megaphone,
  Bot,
  Search,
  BookOpen,
  Mail,
  Phone
} from 'lucide-react';
import { LanguageProvider } from '@/contexts/language-context';
import { useLanguage } from '@/contexts/language-context';

interface HelpContentProps {
  language: 'es' | 'en';
}

function HelpContentInner() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      title: t.help.categories.gettingStarted,
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      id: 'residents',
      title: t.help.categories.residents,
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      id: 'conversations',
      title: t.help.categories.conversations,
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      id: 'maintenance',
      title: t.help.categories.maintenance,
      icon: Wrench,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      id: 'broadcasts',
      title: t.help.categories.broadcasts,
      icon: Megaphone,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      id: 'ai',
      title: t.help.categories.ai,
      icon: Bot,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredQuestions = Object.entries(t.help.faqs)
    .filter(([key, faq]: [string, any]) => {
      const matchesSearch = !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || faq.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.help.title}</h1>
        <p className="text-muted-foreground">{t.help.description}</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            {t.help.searchTitle}
          </CardTitle>
          <CardDescription>{t.help.searchDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.help.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t.help.categoriesTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="h-auto py-4 flex flex-col items-center gap-2"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-xs">{t.help.allCategories}</span>
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <category.icon className="w-5 h-5" />
              <span className="text-xs">{category.title}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {t.help.faqTitle}
          </CardTitle>
          <CardDescription>
            {selectedCategory
              ? `${filteredQuestions.length} ${t.help.questionsInCategory}`
              : `${filteredQuestions.length} ${t.help.totalQuestions}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredQuestions.map(([key, faq]: [string, any]) => {
                const category = categories.find(c => c.id === faq.category);
                return (
                  <AccordionItem key={key} value={key}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3 pr-4">
                        {category && (
                          <div className={`p-1.5 rounded-md ${category.bgColor} flex-shrink-0 mt-0.5`}>
                            <category.icon className={`w-4 h-4 ${category.color}`} />
                          </div>
                        )}
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-11 pr-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{t.help.noResults}</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-2"
              >
                {t.help.clearFilters}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t.help.support.title}
          </CardTitle>
          <CardDescription>{t.help.support.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a href="mailto:janfaris@blokpr.co" className="text-primary hover:underline">
              janfaris@blokpr.co
            </a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t.help.support.hours}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HelpContent({ language }: HelpContentProps) {
  return (
    <LanguageProvider language={language}>
      <HelpContentInner />
    </LanguageProvider>
  );
}
