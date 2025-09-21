
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import type { ActionButton } from '@/lib/sofia-types';

interface SofiaActionButtonsProps {
  actions: ActionButton[];
  isDisabled?: boolean;
  onActionClick: (action: ActionButton) => void;
}

export const SofiaActionButtons: React.FC<SofiaActionButtonsProps> = ({
  actions,
  onActionClick,
  isDisabled = false,
}) => {
  if (!actions || actions.length === 0) return null;

  const getCostBadgeColor = (cost: ActionButton['cost']) => {
    switch (cost) {
      case 'free':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'low_cost':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCostIcon = (cost: ActionButton['cost']) => {
    switch (cost) {
      case 'free':
        return '🆓';
      case 'low_cost':
        return '⚡';
      case 'premium':
        return '⭐';
      default:
        return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className='flex flex-col gap-2 mt-4'
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.1 }}
        >
          <Button
            variant={action.cost === 'premium' ? 'default' : 'outline'}
            className={`
              w-full justify-start gap-3 h-auto p-3 text-left
              ${
                action.cost === 'premium'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                  : 'hover:bg-accent'
              }
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              transition-all duration-200
            `}
            onClick={() => !isDisabled && onActionClick(action)}
            disabled={isDisabled}
          >
            <div className='flex items-center gap-3 flex-1'>
              {/* Action Icon */}
              {action.icon && (
                <div
                  className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${action.cost === 'premium' ? 'bg-white/20' : 'bg-primary/10'}
                `}
                >
                  <Icon
                    name={action.icon as any}
                    className={`w-4 h-4 ${
                      action.cost === 'premium' ? 'text-white' : 'text-primary'
                    }`}
                  />
                </div>
              )}

              {/* Action Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-sm truncate'>
                    {action.text}
                  </span>

                  {/* Cost Badge */}
                  <span
                    className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                    ${getCostBadgeColor(action.cost)}
                  `}
                  >
                    <span className='text-xs'>{getCostIcon(action.cost)}</span>
                    {action.cost === 'free' && 'Free'}
                    {action.cost === 'low_cost' && 'Quick'}
                    {action.cost === 'premium' && 'Premium'}
                  </span>
                </div>

                {/* Action Description */}
                {action.description && (
                  <p
                    className={`text-xs mt-1 opacity-80 ${
                      action.cost === 'premium'
                        ? 'text-white/80'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {action.description}
                  </p>
                )}
              </div>

              {/* Confirmation indicator */}
              {action.requiresConfirmation && (
                <div
                  className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${action.cost === 'premium' ? 'bg-white/60' : 'bg-orange-400'}
                `}
                />
              )}
            </div>
          </Button>
        </motion.div>
      ))}

      {/* Helper text for premium features */}
      {actions.some(action => action.cost === 'premium') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className='flex items-center gap-2 mt-2 px-3'
        >
          <Icon
            name="info"
            className='w-3 h-3 text-muted-foreground'
          />
          <span className='text-xs text-muted-foreground'>
            Premium features require an active subscription
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SofiaActionButtons;
