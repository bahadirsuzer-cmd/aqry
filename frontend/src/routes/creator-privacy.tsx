import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/creator-privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/creator-privacy"!</div>
}
