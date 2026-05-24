import { Button } from '@mdxforge/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@mdxforge/ui/components/card'
import { Input } from '@mdxforge/ui/components/input'
import { Label } from '@mdxforge/ui/components/label'
import { Textarea } from '@mdxforge/ui/components/textarea'
import { useState } from 'react'
import { sendContactMessage } from '@/api/contact'
import { m } from '@/paraglide/messages'

type FormState = 'idle' | 'sending' | 'success' | 'error'

export function ContactFormCard() {
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const values = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? '')
    }

    try {
      await sendContactMessage({ data: values })
      form.reset()
      setState('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : m.contact_error())
      setState('error')
    }
  }

  const isSending = state === 'sending'

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <CardTitle>{m.contact_form_title()}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="contact-name">{m.contact_name()}</Label>
            <Input id="contact-name" name="name" required minLength={3} maxLength={60} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email">{m.contact_email()}</Label>
            <Input id="contact-email" name="email" required type="email" maxLength={254} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-message">{m.contact_message()}</Label>
            <Textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={1000}
              rows={5}
            />
          </div>

          {state === 'success' && <p className="text-sm text-primary">{m.contact_success()}</p>}
          {state === 'error' && error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSending}>
            {isSending ? m.contact_sending() : m.contact_send()}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
