import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { AddExpenseStep } from '@/pages/AddExpensePage'
import {
  categoryLabelTamil,
  type CategoryDef,
  getCategoryDefinition,
  subcategoryLabelTamil,
} from '@/domain/categories'
import { ta } from '@/translations/ta'
import { cn } from '@/lib/utils'

interface Crumb {
  id: string
  label: string
  isCurrent: boolean
  href?: string
  onActivate?: () => void
  icon?: 'home'
}

function CrumbItem({ crumb }: { crumb: Crumb }) {
  const shared = 'max-w-full min-w-0 break-words text-left text-[0.8125rem] leading-snug sm:text-sm'

  if (crumb.isCurrent) {
    return (
      <span
        className={cn(shared, 'font-semibold text-primary')}
        aria-current="page"
      >
        {crumb.label}
      </span>
    )
  }

  if (crumb.href) {
    return (
      <Link
        to={crumb.href}
        className={cn(
          shared,
          'inline-flex max-w-full items-center gap-1',
          'font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline',
        )}
      >
        {crumb.icon === 'home' ? (
          <Home className="size-3.5 shrink-0 opacity-85" aria-hidden />
        ) : null}
        {crumb.label}
      </Link>
    )
  }

  if (crumb.onActivate) {
    return (
      <button
        type="button"
        onClick={crumb.onActivate}
        className={cn(
          shared,
          'font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-primary hover:underline',
        )}
      >
        {crumb.label}
      </button>
    )
  }

  return <span className={cn(shared, 'font-medium text-muted-foreground')}>{crumb.label}</span>
}

function buildCrumbs(
  step: AddExpenseStep,
  actions: {
    goCategoryStep: () => void
    goSubcategoryStep: (def: CategoryDef) => void
  },
): Crumb[] {
  const home: Crumb = {
    id: 'home',
    label: ta.dashboard,
    isCurrent: false,
    href: '/',
    icon: 'home',
  }

  const flowRoot: Crumb =
    step.name === 'category'
      ? {
          id: 'flow',
          label: ta.addExpense,
          isCurrent: false,
        }
      : {
          id: 'flow',
          label: ta.addExpense,
          isCurrent: false,
          onActivate: actions.goCategoryStep,
        }

  if (step.name === 'category') {
    return [
      home,
      flowRoot,
      { id: 'pick-cat', label: ta.breadcrumbStepCategory, isCurrent: true },
    ]
  }

  if (step.name === 'subcategory') {
    const catName = categoryLabelTamil(step.category.key)
    return [
      home,
      flowRoot,
      {
        id: 'picked-cat',
        label: catName,
        isCurrent: false,
        onActivate: actions.goCategoryStep,
      },
      { id: 'pick-sub', label: ta.breadcrumbStepSubcategory, isCurrent: true },
    ]
  }

  const def = getCategoryDefinition(step.category)
  const catName = categoryLabelTamil(step.category)
  const hasSubs = Boolean(def?.subcategories?.length)

  const crumbs: Crumb[] = [home, flowRoot]

  if (hasSubs && def) {
    crumbs.push({
      id: 'detail-cat',
      label: catName,
      isCurrent: false,
      onActivate: () => actions.goSubcategoryStep(def),
    })
    if (step.subcategory) {
      crumbs.push({
        id: 'detail-sub',
        label: subcategoryLabelTamil(step.subcategory),
        isCurrent: false,
        onActivate: () => actions.goSubcategoryStep(def),
      })
    }
  } else {
    crumbs.push({
      id: 'detail-cat-flat',
      label: catName,
      isCurrent: false,
      onActivate: actions.goCategoryStep,
    })
  }

  crumbs.push({
    id: 'amount',
    label: ta.breadcrumbStepAmount,
    isCurrent: true,
  })

  return crumbs
}

interface ExpenseFlowBreadcrumbProps {
  step: AddExpenseStep
  onGoCategoryStep: () => void
  onGoSubcategoryStep: (def: CategoryDef) => void
}

export function ExpenseFlowBreadcrumb({
  step,
  onGoCategoryStep,
  onGoSubcategoryStep,
}: ExpenseFlowBreadcrumbProps) {
  const crumbs = buildCrumbs(step, {
    goCategoryStep: onGoCategoryStep,
    goSubcategoryStep: onGoSubcategoryStep,
  })

  return (
    <nav
      aria-label={ta.breadcrumbNavLabel}
      className="rounded-2xl border border-border/60 bg-[color-mix(in_srgb,var(--secondary)_50%,var(--card)_50%)] px-3 py-2.5 shadow-sm backdrop-blur-[2px] sm:px-4"
    >
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
        {crumbs.map((crumb, i) => (
          <li key={crumb.id} className="flex max-w-full min-w-0 items-center gap-1">
            {i > 0 ? (
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-aesthetic-petal/90"
              />
            ) : null}
            <CrumbItem crumb={crumb} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
