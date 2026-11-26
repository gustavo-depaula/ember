import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { officeHours, setOfficeHours } from '@/features/plan-of-life/offices'
import { reportFailure } from './failure'

/** An Office's hours to choose from, and the step that keeps the chosen ones and moves on. */
export function useOfficeHours(practiceId: string) {
  const router = useRouter()
  const hours = useQuery({
    queryKey: ['onboarding-office-hours', practiceId],
    queryFn: () => officeHours(practiceId),
  })
  const add = useMutation({
    mutationFn: (hourIds: readonly string[]) => setOfficeHours(practiceId, hourIds),
    onSuccess: () => router.push('/onboarding/reminders'),
    onError: reportFailure,
  })
  return { hours: hours.data ?? [], add }
}
