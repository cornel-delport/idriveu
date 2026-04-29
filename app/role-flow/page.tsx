import { MobileShell } from '@/components/mobile-shell'
import { AppTopBar } from '@/components/app-top-bar'
import { RoleFlowRepresentation } from '@/components/role-flow-representation'

export const metadata = {
  title: 'Role Flow — iDriveU',
}

export default function RoleFlowPage() {
  return (
    <MobileShell>
      <AppTopBar title="Role Flow" backHref="/" />
      <main>
        <RoleFlowRepresentation />
      </main>
    </MobileShell>
  )
}
