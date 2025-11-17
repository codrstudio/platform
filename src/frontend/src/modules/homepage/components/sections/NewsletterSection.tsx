/**
 * NewsletterSection Component
 *
 * Newsletter subscription section with:
 * - Email capture form
 * - Form validation
 * - Success/error states
 * - JQEL integration for subscription
 * - Multiple layout options
 * - Privacy policy link
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useJQELMutation } from '@/hooks/useJQEL';
import { LinkHandler } from '../shared/LinkHandler';
import type { NewsletterSectionConfig } from '../../types';

interface NewsletterSectionProps {
  config: NewsletterSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const NewsletterSection: React.FC<NewsletterSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // JQEL mutation for subscription
  const mutation = useJQELMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!isValidEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (config.requireName && !name.trim()) {
      setStatus('error');
      setErrorMessage('Please enter your name');
      return;
    }

    if (config.requireConsent && !consent) {
      setStatus('error');
      setErrorMessage('Please accept the terms to subscribe');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // Use configured endpoint or default JQEL mutation
      if (config.endpoint) {
        // Custom endpoint (future implementation)
        const response = await fetch(config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name,
            consent,
            source: 'homepage',
            portalId,
          }),
        });

        if (!response.ok) {
          throw new Error('Subscription failed');
        }
      } else {
        // Default JQEL mutation
        await mutation.mutateAsync({
          schema: 'system',
          mutate: 'newsletter_subscription',
          action: 'insert',
          values: {
            email,
            name,
            consent,
            source: 'homepage',
            portalId,
            subscribedAt: new Date().toISOString(),
          },
        });
      }

      setStatus('success');
      setEmail('');
      setName('');
      setConsent(false);

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(config.errorMessage || 'Something went wrong. Please try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  const layout = config.layout || 'centered';
  const showIcon = config.showIcon !== false;

  return (
    <section
      id="newsletter"
      className={cn(
        'py-16 px-4 md:px-6 lg:px-8',
        config.background === 'primary' && 'bg-primary text-primary-foreground',
        config.background === 'muted' && 'bg-muted',
        config.background === 'gradient' && 'bg-gradient-to-r from-primary/10 to-primary/5',
        config.className
      )}
    >
      <div className="container mx-auto max-w-4xl">
        <div className={cn(
          layout === 'centered' && 'text-center',
          layout === 'split' && 'md:flex md:items-center md:gap-8',
          layout === 'compact' && 'max-w-md mx-auto text-center'
        )}>
          {/* Content */}
          <div className={cn(
            layout === 'split' && 'md:flex-1',
            layout === 'compact' && 'mb-6'
          )}>
            {/* Icon */}
            {showIcon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'inline-flex items-center justify-center',
                  'w-16 h-16 rounded-full bg-primary/10 mb-4',
                  layout === 'split' && 'md:mb-0 md:mr-4'
                )}
              >
                <Mail className="h-8 w-8 text-primary" />
              </motion.div>
            )}

            {/* Title */}
            {config.title && (
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  'text-3xl md:text-4xl font-bold mb-4',
                  layout === 'compact' && 'text-2xl md:text-3xl'
                )}
              >
                {config.title}
              </motion.h2>
            )}

            {/* Subtitle */}
            {config.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  'text-lg text-muted-foreground',
                  layout === 'compact' && 'text-base',
                  config.background === 'primary' && 'text-primary-foreground/80'
                )}
              >
                {config.subtitle}
              </motion.p>
            )}

            {/* Benefits */}
            {config.benefits && config.benefits.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={cn(
                  'mt-4 space-y-2',
                  layout === 'centered' && 'max-w-md mx-auto text-left'
                )}
              >
                {config.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: layout === 'split' ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            className={cn(
              'mt-8',
              layout === 'split' && 'md:mt-0 md:flex-1',
              layout === 'compact' && 'mt-6'
            )}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              {config.requireName && (
                <Input
                  type="text"
                  placeholder={config.namePlaceholder || "Your name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  className={cn(
                    config.background === 'primary' && 'bg-primary-foreground/10 border-primary-foreground/20'
                  )}
                />
              )}

              {/* Email Field */}
              <div className={cn(
                layout === 'inline' && 'flex gap-2'
              )}>
                <Input
                  type="email"
                  placeholder={config.placeholder || "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading' || status === 'success'}
                  className={cn(
                    layout === 'inline' && 'flex-1',
                    config.background === 'primary' && 'bg-primary-foreground/10 border-primary-foreground/20'
                  )}
                />
                {layout === 'inline' && (
                  <Button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    variant={config.background === 'primary' ? 'secondary' : 'default'}
                  >
                    {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {status === 'success' ? 'Subscribed!' : config.buttonText || 'Subscribe'}
                  </Button>
                )}
              </div>

              {/* Consent Checkbox */}
              {config.requireConsent && (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1"
                    disabled={status === 'loading' || status === 'success'}
                  />
                  <label htmlFor="consent" className="text-sm text-muted-foreground">
                    {config.consentText || (
                      <>
                        I agree to receive newsletters and accept the{' '}
                        {config.privacyLink ? (
                          <LinkHandler link={config.privacyLink} className="underline">
                            privacy policy
                          </LinkHandler>
                        ) : (
                          'privacy policy'
                        )}
                      </>
                    )}
                  </label>
                </div>
              )}

              {/* Submit Button (for non-inline layouts) */}
              {layout !== 'inline' && (
                <Button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  variant={config.background === 'primary' ? 'secondary' : 'default'}
                  className="w-full"
                >
                  {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {status === 'success' ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Subscribed Successfully!
                    </>
                  ) : (
                    config.buttonText || 'Subscribe to Newsletter'
                  )}
                </Button>
              )}

              {/* Status Messages */}
              {status === 'success' && (
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {config.successMessage || 'Thank you for subscribing! Check your email for confirmation.'}
                  </AlertDescription>
                </Alert>
              )}

              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Privacy Note */}
              {config.privacyNote && status === 'idle' && (
                <p className="text-xs text-muted-foreground text-center">
                  {config.privacyNote}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;