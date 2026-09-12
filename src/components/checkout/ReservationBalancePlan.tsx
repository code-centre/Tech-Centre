'use client'

import CohortInstallmentPlanPreview from './CohortInstallmentPlanPreview'

interface Props {
  selectedCohortId: number | null
  balanceAmount: number
  selectedInstallments: number
  setSelectedInstallments: (value: number) => void
}

export default function ReservationBalancePlan(props: Props) {
  return (
    <CohortInstallmentPlanPreview
      selectedCohortId={props.selectedCohortId}
      amount={props.balanceAmount}
      installmentCount={props.selectedInstallments}
      setInstallmentCount={props.setSelectedInstallments}
      mode="reservation_balance"
    />
  )
}
