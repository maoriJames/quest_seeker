import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PickRegionProps = {
  value: string
  onChange: (value: string) => void
}

export default function PickRegion({ value, onChange }: PickRegionProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="region" className="text-sm font-medium">
        Quest Region
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Browse all" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Browse all">Browse all</SelectItem>
          <SelectItem value="Auckland">Auckland</SelectItem>
          <SelectItem value="Bay of Plenty">Bay of Plenty</SelectItem>
          <SelectItem value="Canterbury">Canterbury</SelectItem>
          <SelectItem value="Gisborne">Gisborne</SelectItem>
          <SelectItem value="Hawke's Bay">Hawke's Bay</SelectItem>
          <SelectItem value="Manawatu-Wanganui">Manawatu-Wanganui</SelectItem>
          <SelectItem value="Marlborough">Marlborough</SelectItem>
          <SelectItem value="Nelson">Nelson</SelectItem>
          <SelectItem value="Northland">Northland</SelectItem>
          <SelectItem value="Otago">Otago</SelectItem>
          <SelectItem value="Southland">Southland</SelectItem>
          <SelectItem value="Taranaki">Taranaki</SelectItem>
          <SelectItem value="Tasman">Tasman</SelectItem>
          <SelectItem value="Waikato">Waikato</SelectItem>
          <SelectItem value="Wellington">Wellington</SelectItem>
          <SelectItem value="West Coast">West Coast</SelectItem>
          <SelectItem value="Nationwide">Nationwide</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
