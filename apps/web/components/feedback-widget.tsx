"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function FeedbackWidget() {
  const [value, setValue] = React.useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.trim()) return
    console.log("[feedback]", value)
    toast.success("Díky, dorazilo to.")
    setValue("")
  }

  return (
    <section className="mt-16 border-t border-card px-6 py-6">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-gray-400">Co ti chybí? Napiš nám.</p>
        <form
          onSubmit={handleSubmit}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <Input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Tvůj nápad..."
            aria-label="Tvůj nápad"
            className="sm:flex-1"
          />
          <Button type="submit" variant="primary">
            Poslat
          </Button>
        </form>
      </div>
    </section>
  )
}
