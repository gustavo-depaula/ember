import { Link } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, XStack, YStack } from 'tamagui'
import { Card, Typography } from '@/components'

// Minimal church shape this row needs — satisfied by a full Church, a search hit, or a saved snapshot.
export type ChurchRowData = {
  id: string
  name: string
  address?: string | null
  city?: string | null
  region?: string | null
}

// A name + where-it-is row. Used for search hits and saved churches, which carry no schedule, so it
// taps through to the detail screen that loads the full church.
export function ChurchSearchRow({ church }: { church: ChurchRowData }) {
  const theme = useTheme()
  const where = [church.address, church.city, church.region].filter(Boolean).join(' · ')

  return (
    <Link href={{ pathname: '/mass-times/[churchId]', params: { churchId: church.id } }} asChild>
      <Pressable>
        <Card>
          <XStack justifyContent="space-between" alignItems="center" gap="$sm">
            <YStack flexShrink={1} gap="$xs">
              <Typography variant="interface" fontSize="$4" fontWeight="600">
                {church.name}
              </Typography>
              {where ? (
                <Typography variant="annotation" numberOfLines={1}>
                  {where}
                </Typography>
              ) : null}
            </YStack>
            <ChevronRight size={18} color={theme.colorSecondary?.val} />
          </XStack>
        </Card>
      </Pressable>
    </Link>
  )
}
