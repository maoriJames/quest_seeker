import { useLocation, useNavigate } from 'react-router-dom'
import QuestListItem from '@/components/QuestListItem'
import { useQuestList } from '@/hooks/userQuests'
import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import type { MyQuest, Profile, Quest } from '@/types'
import AddQuestButton from '@/components/AddQuestButton'
import { useProfileList } from '@/hooks/userProfiles'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Toolbar } from '@/components/Toolbar'
import { Home } from 'lucide-react'

export default function QuestPage() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const selectedRegion = searchParams.get('region') || 'Browse all'
  const { data: quests, error, isLoading } = useQuestList()
  const allQuests: Quest[] = quests ?? []
  const { data: profiles } = useProfileList()

  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('title')

  const today = new Date().toISOString().split('T')[0]

  const profileMap: Record<string, Profile> = useMemo(() => {
    const map: Record<string, Profile> = {}

    profiles?.forEach((p) => {
      if (!p?.id) return

      map[p.id] = {
        id: p.id,
        full_name: p.full_name ?? '',
        email: p.email ?? '',
        organization_name: p.organization_name ?? '',
        registration_number: p.registration_number ?? '',
        business_type: p.business_type ?? '',
        organization_description: p.organization_description ?? '',
        primary_contact_name: p.primary_contact_name ?? '',
        primary_contact_position: p.primary_contact_position ?? '',
        primary_contact_phone: p.primary_contact_phone ?? '',
        about_me: p.about_me ?? '',
        secondary_contact_name: p.secondary_contact_name ?? '',
        secondary_contact_position: p.secondary_contact_position ?? '',
        secondary_contact_phone: p.secondary_contact_phone ?? '',
        image: p.image ?? '',
        image_thumbnail: p.image_thumbnail ?? '',
        role: p.role ?? 'seeker',
        my_quests: (() => {
          if (!p.my_quests) return []
          if (typeof p.my_quests === 'string') {
            try {
              return JSON.parse(p.my_quests) as MyQuest[]
            } catch {
              return []
            }
          }
          return p.my_quests // if it's already an array
        })(),
      }
    })

    return map
  }, [profiles])

  const validQuests = useMemo(() => {
    return allQuests.filter((quest) => {
      const questEndDate = quest.quest_end?.split('T')[0] ?? ''
      const matchesRegion =
        selectedRegion === 'Browse all' || quest.region === selectedRegion
      return matchesRegion && questEndDate >= today
    })
  }, [allQuests, selectedRegion, today])

  // 🔍 Filter quests by search term (name, region, organisation)
  const filteredQuests = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return validQuests.filter((q) => {
      if (!q.creator_id) return false // skip quests with no creator_id

      const creatorOrg = profileMap[q.creator_id]?.organization_name ?? ''

      return (
        q.quest_name?.toLowerCase().includes(term) ||
        q.region?.toLowerCase().includes(term) ||
        creatorOrg.toLowerCase().includes(term)
      )
    })
  }, [validQuests, searchTerm, profileMap])

  // 🧭 Sort quests
  const sortedQuests = useMemo(() => {
    const sorted = [...filteredQuests]

    switch (sortOption) {
      case 'title':
        sorted.sort((a, b) =>
          (a.quest_name || '').localeCompare(b.quest_name || '')
        )
        break
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.quest_start || '').getTime() -
            new Date(a.quest_start || '').getTime()
        )
        break
      case 'oldest':
        sorted.sort(
          (a, b) =>
            new Date(a.quest_start || '').getTime() -
            new Date(b.quest_start || '').getTime()
        )
        break
      case 'recently-added':
        sorted.sort((a, b) => (b.id > a.id ? 1 : -1))
        break
      case 'expiry-soonest':
        sorted.sort(
          (a, b) =>
            new Date(a.quest_end || '').getTime() -
            new Date(b.quest_end || '').getTime()
        )
        break
      case 'expiry-furthest':
        sorted.sort(
          (a, b) =>
            new Date(b.quest_end || '').getTime() -
            new Date(a.quest_end || '').getTime()
        )
        break
      default:
        break
    }

    return sorted
  }, [filteredQuests, sortOption])

  const pageSize = 12
  const [visibleCount, setVisibleCount] = useState(pageSize)

  const visibleQuests = sortedQuests.slice(0, visibleCount)

  const fetchMoreQuests = () => {
    setTimeout(() => {
      setVisibleCount((prev) => prev + pageSize)
    }, 500) // simulates load time
  }
  console.log('Quest: ', allQuests)
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between w-full">
            <Toolbar
              buttons={[
                {
                  label: <Home className="w-5 h-5" />,
                  onClick: () => navigate('/user/region'),
                },
                {
                  label: 'My Account',
                  onClick: () => navigate('/user/account'),
                },
                {
                  label: 'My Quests',
                  onClick: () =>
                    navigate('/user/account', {
                      state: { defaultTab: 'my-quests' },
                    }),
                },
                { label: 'About Us', onClick: () => navigate('/user/about') },
                { label: 'FAQ', onClick: () => navigate('/user/faq') },
                {
                  label: <AddQuestButton to="/user/quest/create" />,
                  onClick: () => {}, // no navigation required
                },
              ]}
            />
          </div>
          {/* Search + Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-2 justify-between items-center mb-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search quests by name or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            />

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            >
              <option value="title">Title A–Z</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="recently-added">Recently Added</option>
              <option value="expiry-soonest">Expiry — Soonest First</option>
              <option value="expiry-furthest">Expiry — Furthest First</option>
            </select>
          </div>

          {/* Loading / error / empty states */}
          {isLoading && <p>Loading quests...</p>}
          {error && <p>Failed to fetch quests.</p>}
          {!isLoading && !error && sortedQuests.length === 0 && (
            <p>No quests match your search or filters.</p>
          )}

          <InfiniteScroll
            dataLength={visibleQuests.length}
            next={fetchMoreQuests}
            hasMore={visibleCount < sortedQuests.length}
            loader={<p className="text-center py-3">Loading more quests...</p>}
            scrollThreshold={0.9} // triggers at 90% scroll
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleQuests.map((quest: Quest) => (
                <QuestListItem
                  key={quest.id}
                  quest={{
                    ...quest,
                    quest_name: quest.quest_name ?? 'Untitled Quest',
                    quest_image: quest.quest_image ?? undefined,
                    quest_start: quest.quest_start ?? undefined,
                    quest_end: quest.quest_end ?? undefined,
                    region: quest.region ?? 'Unknown',
                  }}
                />
              ))}
            </div>
          </InfiniteScroll>

          {/* Bottom: Home button centered */}
          {/* <div className="flex justify-center mt-4">
            <HomeButton />
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
