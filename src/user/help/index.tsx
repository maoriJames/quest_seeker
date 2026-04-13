import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import logo from '@/assets/images/no_ordinary.png'
import { helpSections } from '@/assets/helpSections'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate } from 'react-router-dom'
import { Toolbar } from '@/components/Toolbar'
import SignOutButton from '@/components/SignOutButton'
import { fetchAuthSession } from 'aws-amplify/auth'
export default function Help() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(
    location.state?.defaultTab || 'help',
  )
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // All useEffect hooks together
  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (location.state?.defaultTab) {
      setActiveTab(location.state.defaultTab)
    }
  }, [location.state])

  // Helper functions after hooks
  const checkAuthStatus = async () => {
    try {
      const session = await fetchAuthSession()
      setIsAuthenticated(!!session.tokens)
    } catch (error) {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  // NOW you can do early returns
  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div
      className="relative h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full h-full max-h-full flex flex-col overflow-hidden">
        <CardContent className="flex flex-col gap-4 flex-1 min-h-0 p-0">
          {!isAuthenticated ? (
            <div className="p-4">
              <Button variant="outline" onClick={() => navigate('/user/auth')}>
                ← Back to Login
              </Button>
            </div>
          ) : (
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-md p-4 shadow-sm border-b">
              <Toolbar>
                <Button
                  variant="yellow"
                  onClick={() => navigate('/user/region')}
                  size="icon"
                  aria-label="Home"
                >
                  <Home />
                </Button>

                <Button
                  variant="yellow"
                  onClick={() => navigate('/user/account')}
                >
                  My Account
                </Button>

                <Button
                  variant="yellow"
                  onClick={() =>
                    navigate('/user/account', {
                      state: { defaultTab: 'my-quests' },
                    })
                  }
                >
                  My Quests
                </Button>

                <Button
                  variant="yellow"
                  onClick={() => navigate('/user/leader')}
                >
                  Leader Board
                </Button>

                <Button
                  variant={activeTab === 'help' ? 'default' : 'yellow'}
                  onClick={() => navigate('/user/help')}
                >
                  Help
                </Button>
                <SignOutButton />
              </Toolbar>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            <div className="w-full max-w-3xl mx-auto">
              <img src={logo} alt="logo" />
              <h1 className="text-3xl font-bold">
                Fundraising & Fun Through Treasure Hunt Quests: QuestSeeker Help
                Guide
              </h1>

              <ul className="flex flex-col gap-2 mt-4">
                {helpSections.map((section, index) => (
                  <li
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(index)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/70 hover:bg-yellow-50 transition-colors"
                    >
                      <h2 className="text-lg font-semibold text-gray-800">
                        {section.title}
                      </h2>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                      )}
                    </button>

                    {openIndex === index && (
                      <div className="px-5 py-4 bg-white/50 text-gray-700 text-sm border-t border-gray-100">
                        <ul className="flex flex-col gap-3 list-disc list-outside pl-5">
                          {section.paragraphs.map((para, i) => (
                            <li key={i}>{para}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
