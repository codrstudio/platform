/**
 * FooterSection Component
 *
 * Footer section with:
 * - Link groups (multiple columns)
 * - Social media links
 * - Copyright notice
 * - Logo/branding
 * - Newsletter signup (optional)
 * - Flexible layouts
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { LinkHandler } from '../shared/LinkHandler';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { FooterSectionConfig } from '../../types';

interface FooterSectionProps {
  config: FooterSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Get icon component by name
 */
function getIcon(iconName?: string): React.ComponentType<any> | null {
  if (!iconName) return null;

  const Icon = (LucideIcons as any)[iconName];
  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in Lucide icons`);
    return null;
  }

  return Icon;
}

/**
 * Social Media Icon Mapper
 */
function getSocialIcon(platform: string): React.ComponentType<any> | null {
  const socialIcons: Record<string, string> = {
    facebook: 'Facebook',
    twitter: 'Twitter',
    instagram: 'Instagram',
    linkedin: 'Linkedin',
    youtube: 'Youtube',
    github: 'Github',
    discord: 'MessageSquare',
    twitch: 'Twitch',
    tiktok: 'Music2',
    pinterest: 'Pin',
    reddit: 'MessageCircle',
    whatsapp: 'MessageCircle',
    telegram: 'Send',
  };

  const iconName = socialIcons[platform.toLowerCase()];
  return iconName ? getIcon(iconName) : getIcon('Link2');
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const currentYear = new Date().getFullYear();
  const layout = config.layout || 'default';

  return (
    <footer
      id="footer"
      className={cn(
        'border-t',
        config.background === 'dark' && 'bg-gray-900 text-gray-100',
        config.background === 'primary' && 'bg-primary text-primary-foreground',
        config.background === 'muted' && 'bg-muted',
        config.className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className={cn(
          'py-12 md:py-16',
          layout === 'centered' && 'text-center'
        )}>
          {/* Top Section - Logo and Description */}
          {(config.logo || config.title || config.description) && (
            <div className={cn(
              'mb-8',
              layout !== 'centered' && 'lg:flex lg:justify-between lg:items-start'
            )}>
              <div className={cn(
                layout !== 'centered' && 'max-w-md',
                layout === 'centered' && 'max-w-2xl mx-auto'
              )}>
                {/* Logo or Title */}
                {config.logo ? (
                  <img
                    src={config.logo}
                    alt={config.title || 'Logo'}
                    className={cn(
                      'h-10 mb-4',
                      layout === 'centered' && 'mx-auto'
                    )}
                  />
                ) : config.title ? (
                  <h3 className="text-2xl font-bold mb-4">{config.title}</h3>
                ) : null}

                {/* Description */}
                {config.description && (
                  <p className={cn(
                    'text-muted-foreground mb-6',
                    config.background === 'dark' && 'text-gray-400'
                  )}>
                    {config.description}
                  </p>
                )}

                {/* Newsletter in top section (optional) */}
                {config.newsletter && layout !== 'centered' && (
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">
                      {config.newsletter.title || 'Stay updated'}
                    </p>
                    <form className="flex gap-2">
                      <Input
                        type="email"
                        placeholder={config.newsletter.placeholder || 'Enter your email'}
                        className={cn(
                          'flex-1',
                          config.background === 'dark' && 'bg-gray-800 border-gray-700'
                        )}
                      />
                      <Button
                        type="submit"
                        variant={config.background === 'dark' ? 'secondary' : 'default'}
                      >
                        Subscribe
                      </Button>
                    </form>
                  </div>
                )}
              </div>

              {/* Social Links (top right for default layout) */}
              {config.social && config.social.length > 0 && layout !== 'centered' && (
                <div className="mt-6 lg:mt-0">
                  <div className="flex gap-4">
                    {config.social.map((social, index) => {
                      const Icon = getSocialIcon(social.platform);
                      return (
                        <motion.a
                          key={`social-${index}`}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            'p-2 rounded-lg transition-colors',
                            'hover:bg-primary/10 hover:text-primary',
                            config.background === 'dark' && 'hover:bg-gray-800'
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          aria-label={social.platform}
                        >
                          {Icon && <Icon className="h-5 w-5" />}
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Link Groups */}
          {config.groups && config.groups.length > 0 && (
            <div className={cn(
              'grid gap-8 mb-8',
              layout === 'centered' ? 'md:grid-cols-2 lg:grid-cols-3 text-left' :
              config.groups.length === 2 ? 'md:grid-cols-2' :
              config.groups.length === 3 ? 'md:grid-cols-3' :
              config.groups.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
              config.groups.length === 5 ? 'md:grid-cols-2 lg:grid-cols-5' :
              'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
            )}>
              {config.groups.map((group, groupIndex) => (
                <div key={`footer-group-${groupIndex}`}>
                  <h4 className={cn(
                    'font-semibold mb-4',
                    config.background === 'dark' ? 'text-gray-200' : 'text-foreground'
                  )}>
                    {group.title}
                  </h4>
                  <ul className="space-y-2">
                    {group.links.map((link, linkIndex) => (
                      <li key={`footer-link-${groupIndex}-${linkIndex}`}>
                        <LinkHandler
                          link={link.link}
                          className={cn(
                            'text-sm transition-colors',
                            config.background === 'dark'
                              ? 'text-gray-400 hover:text-gray-200'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {link.label}
                        </LinkHandler>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Newsletter for centered layout */}
          {config.newsletter && layout === 'centered' && (
            <div className="max-w-md mx-auto mb-8">
              <p className="text-sm font-medium mb-2">
                {config.newsletter.title || 'Stay updated'}
              </p>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder={config.newsletter.placeholder || 'Enter your email'}
                  className={cn(
                    'flex-1',
                    config.background === 'dark' && 'bg-gray-800 border-gray-700'
                  )}
                />
                <Button
                  type="submit"
                  variant={config.background === 'dark' ? 'secondary' : 'default'}
                >
                  Subscribe
                </Button>
              </form>
            </div>
          )}

          {/* Social Links for centered layout */}
          {config.social && config.social.length > 0 && layout === 'centered' && (
            <div className="flex justify-center gap-4 mb-8">
              {config.social.map((social, index) => {
                const Icon = getSocialIcon(social.platform);
                return (
                  <motion.a
                    key={`social-${index}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      'hover:bg-primary/10 hover:text-primary',
                      config.background === 'dark' && 'hover:bg-gray-800'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.platform}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <div className={cn(
          'border-t py-6',
          config.background === 'dark' ? 'border-gray-800' : 'border-border',
          layout === 'centered' ? 'text-center' : 'md:flex md:justify-between md:items-center'
        )}>
          {/* Copyright */}
          <div className={cn(
            'text-sm',
            config.background === 'dark' ? 'text-gray-400' : 'text-muted-foreground'
          )}>
            {config.copyright || `© ${currentYear} ${config.title || 'Company'}. All rights reserved.`}
          </div>

          {/* Legal Links */}
          {config.legal && config.legal.length > 0 && (
            <div className={cn(
              'mt-4 md:mt-0 flex gap-6',
              layout === 'centered' && 'justify-center'
            )}>
              {config.legal.map((item, index) => (
                <LinkHandler
                  key={`legal-${index}`}
                  link={item.link}
                  className={cn(
                    'text-sm transition-colors',
                    config.background === 'dark'
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                </LinkHandler>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;