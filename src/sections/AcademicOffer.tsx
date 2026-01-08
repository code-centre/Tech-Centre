// Componente simplificado que ahora solo exporta ProgramsList con fetchPrograms
import { ProgramsList } from '@/components/ProgramsList'

export default function AcademicOffer() {
  return (
    <ProgramsList 
      fetchPrograms={true}
      showHeader={true}
      backgroundColor="bg-background"
      horizontalScroll={true}
    />
  )
}
