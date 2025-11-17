/**
 * FAQSection Component
 *
 * Displays frequently asked questions with:
 * - Accordion-style expandable items
 * - Categories support
 * - Search functionality (optional)
 * - JQEL datasource support for dynamic FAQs
 * - Responsive design
 */

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useJQELQuery } from '@/hooks/useJQEL';
import { evaluateTemplate } from '@/lib/templateEngine';
import type { FAQSectionConfig } from '../../types';

interface FAQSectionProps {
  config: FAQSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * FAQ Item Component
 */
const FAQItem: React.FC<{
  question: string;
  answer: string;
  category?: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}> = ({ question, answer, category, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="border rounded-lg overflow-hidden"
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-full px-6 py-4 text-left flex items-center justify-between gap-4',
          'hover:bg-muted/50 transition-colors',
          isOpen && 'bg-muted/30'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-base md:text-lg">{question}</h3>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 py-4 border-t">
              <p className="text-muted-foreground whitespace-pre-wrap">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/**
 * Dynamic FAQs with JQEL
 */
const DynamicFAQs: React.FC<{
  datasource: FAQSectionConfig['datasource'];
  searchQuery: string;
  openItems: Set<string>;
  onToggle: (id: string) => void;
  startIndex: number;
}> = ({ datasource, searchQuery, openItems, onToggle, startIndex }) => {
  if (!datasource?.query) return null;

  const { data: result, isLoading, isError } = useJQELQuery(
    datasource.query,
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !result?.success) {
    return null; // Fail silently in production
  }

  // Process data
  const items = datasource.multiple && Array.isArray(result.data)
    ? result.data
    : [result.data];

  const faqs = items.slice(0, datasource.limit || 20).map((item: any, idx: number) => {
    const mapping = datasource.mapping || {};
    return {
      id: `dynamic-faq-${idx}`,
      question: mapping.question ? evaluateTemplate(mapping.question, item) : item.question,
      answer: mapping.answer ? evaluateTemplate(mapping.answer, item) : item.answer,
      category: mapping.category ? evaluateTemplate(mapping.category, item) : item.category,
    };
  });

  // Filter by search
  const filteredFaqs = searchQuery
    ? faqs.filter((faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faq.category && faq.category.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : faqs;

  return (
    <>
      {filteredFaqs.map((faq, index) => (
        <FAQItem
          key={faq.id}
          question={faq.question}
          answer={faq.answer}
          category={faq.category}
          isOpen={openItems.has(faq.id)}
          onToggle={() => onToggle(faq.id)}
          index={startIndex + index}
        />
      ))}
    </>
  );
};

export const FAQSection: React.FC<FAQSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Toggle FAQ item
  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Close others if accordion mode
        if (config.accordion) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  // Filter static items
  const filteredItems = useMemo(() => {
    let items = config.items || [];

    // Filter by category
    if (selectedCategory) {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return items;
  }, [config.items, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    config.items?.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [config.items]);

  const layout = config.layout || 'single';
  const showSearch = config.showSearch !== false && (config.items.length > 5 || config.datasource);

  return (
    <section
      id="faq"
      className={cn(
        'py-16 px-4 md:px-6 lg:px-8',
        config.className
      )}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          {config.title && (
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              {config.title}
            </motion.h2>
          )}
          {config.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              {config.subtitle}
            </motion.p>
          )}
        </div>

        {/* Search and Filters */}
        {(showSearch || categories.length > 0) && (
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Category Filters */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Badge>
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQ Items */}
        <div
          className={cn(
            'space-y-4',
            layout === 'two-column' && 'md:grid md:grid-cols-2 md:gap-4 md:space-y-0'
          )}
        >
          {/* Static FAQs */}
          {filteredItems.map((item, index) => {
            const itemId = `faq-${index}`;
            return (
              <FAQItem
                key={itemId}
                question={item.question}
                answer={item.answer}
                category={item.category}
                isOpen={openItems.has(itemId)}
                onToggle={() => toggleItem(itemId)}
                index={index}
              />
            );
          })}

          {/* Dynamic FAQs */}
          {config.datasource && (
            <DynamicFAQs
              datasource={config.datasource}
              searchQuery={searchQuery}
              openItems={openItems}
              onToggle={toggleItem}
              startIndex={filteredItems.length}
            />
          )}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && !config.datasource && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No FAQs found matching your search'
                : 'No FAQs configured'}
            </p>
          </div>
        )}

        {/* Contact CTA */}
        {config.contactCTA && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center p-6 bg-muted/30 rounded-lg"
          >
            <h3 className="text-lg font-semibold mb-2">
              {config.contactCTA.title || "Still have questions?"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {config.contactCTA.description || "We're here to help"}
            </p>
            {config.contactCTA.link && (
              <NavigationButton
                link={config.contactCTA.link}
                variant={config.contactCTA.variant || 'default'}
              >
                {config.contactCTA.label || 'Contact Us'}
              </NavigationButton>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

// Import NavigationButton from LinkHandler
import { NavigationButton } from '../shared/LinkHandler';

export default FAQSection;