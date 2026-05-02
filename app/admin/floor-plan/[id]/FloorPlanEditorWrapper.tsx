'use client'

// Client boundary needed so `next/dynamic` with ssr:false is valid here.
import dynamic from 'next/dynamic'
import type { EditorTable } from './FloorPlanEditor'

const FloorPlanEditor = dynamic(() => import('./FloorPlanEditor'), { ssr: false })

interface Props {
  restaurantId:     string
  initialTables:    EditorTable[]
  floorPlanEnabled: boolean
}

export default function FloorPlanEditorWrapper(props: Props) {
  return <FloorPlanEditor {...props} />
}
