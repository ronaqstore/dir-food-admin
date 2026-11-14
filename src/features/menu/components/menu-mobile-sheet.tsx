import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { IconToolsKitchen2 } from '@tabler/icons-react';
import type { MenuMobileSheetProps } from '../types';

export function MenuMobileSheet({
  open,
  onOpenChange,
  selectedCategory,
  onSelectCategory,
  categories,
  categoryCounts,
  allCategoriesTotal,
  t
}: MenuMobileSheetProps) {
  const handleSelectAll = () => {
    onSelectCategory('all');
    onOpenChange(false);
  };

  const handleSelectCategory = (catId: string) => {
    onSelectCategory(catId);
    onOpenChange(false);
    const el = document.getElementById(`cat-section-${catId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {categories && categories.length > 1 && (
        <div className='sm:hidden fixed bottom-20 inset-e-4 z-40'>
          <Button
            type='button'
            size='sm'
            onClick={() => onOpenChange(true)}
            className='rounded-full shadow-lg gap-2 bg-foreground text-background hover:bg-foreground/90 px-4 py-2 text-xs font-semibold'
          >
            <IconToolsKitchen2 className='size-4' />
            <span>{t('menuItems.categoryJump')}</span>
            <Badge variant='secondary' className='h-4 px-1.5 text-[10px] bg-background/20 text-background'>
              {categories.length}
            </Badge>
          </Button>
        </div>
      )}

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='bottom' className='rounded-t-2xl max-h-[75vh] overflow-y-auto px-4 py-6'>
          <SheetHeader className='mb-4 text-start'>
            <SheetTitle className='text-base font-bold flex items-center gap-2'>
              <IconToolsKitchen2 className='size-5 text-primary' />
              <span>{t('menuItems.categoryJump')}</span>
            </SheetTitle>
          </SheetHeader>

          <div className='grid gap-1.5 pb-6'>
            <button
              type='button'
              onClick={handleSelectAll}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all text-start ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'hover:bg-muted font-medium text-foreground'
              }`}
            >
              <span>{t('menuItems.filterByCategory')}</span>
              <Badge variant='outline' className={selectedCategory === 'all' ? 'border-primary-foreground text-primary-foreground' : ''}>
                {allCategoriesTotal}
              </Badge>
            </button>

            {categories?.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type='button'
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all text-start ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-muted font-medium text-foreground'
                  }`}
                >
                  <span>{cat.name}</span>
                  <Badge variant='outline' className={isSelected ? 'border-primary-foreground text-primary-foreground' : ''}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

