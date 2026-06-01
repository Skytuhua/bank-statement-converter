import { useMemo } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Stepper } from './components/Stepper'
import { LoadStep } from './components/LoadStep'
import { MapStep } from './components/MapStep'
import { PreviewStep } from './components/PreviewStep'
import { ExportStep } from './components/ExportStep'
import { useConverter, STEPS, type Step } from './state/useConverter'
import { useTheme } from './lib/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()
  const api = useConverter()
  const { state } = api

  // OFX/QIF inputs skip the Map step; CSV uses all four.
  const steps = useMemo<Step[]>(
    () => (state.inputFormat && state.inputFormat !== 'csv' ? ['load', 'preview', 'export'] : STEPS),
    [state.inputFormat],
  )

  // Highest reached step gates which stepper items are clickable.
  const highest: Step = state.step

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onToggleTheme={toggle} />

      {state.inputFormat && (
        <Stepper steps={steps} current={state.step} highest={highest} onJump={api.actions.setStep} />
      )}

      <main className="flex-1">
        {state.step === 'load' && <LoadStep api={api} />}
        {state.step === 'map' && <MapStep api={api} />}
        {state.step === 'preview' && <PreviewStep api={api} />}
        {state.step === 'export' && <ExportStep api={api} />}
      </main>

      <Footer />
    </div>
  )
}
