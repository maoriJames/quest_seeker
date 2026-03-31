import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import logo from '@/assets/images/no_ordinary.svg'
import { helpSections } from '@/assets/helpSections'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
export default function Help() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-5xl w-full flex flex-col">
        <CardContent className="flex flex-col gap-4 p-6">
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
          <Button variant="yellow" onClick={() => navigate(-1)}>
            Back to Quests
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
