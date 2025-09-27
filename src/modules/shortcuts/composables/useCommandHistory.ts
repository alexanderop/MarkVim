import type { Command } from './useShortcuts'
import { useLocalStorage } from '@vueuse/core'
import { readonly } from 'vue'
import { useDataReset } from '@/shared/composables/useDataReset'

export function useCommandHistory() {
  const commandHistory = useLocalStorage<string[]>('markvim-command-history', [])

  const { onDataReset } = useDataReset()
  onDataReset(() => {
    commandHistory.value = []
  })

  function trackCommandUsage(commandId: string) {
    const history = [...commandHistory.value]

    // Remove the command if it already exists
    const existingIndex = history.indexOf(commandId)
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1)
    }

    // Add to the beginning
    history.unshift(commandId)

    // Keep only the last 20 commands
    commandHistory.value = history.slice(0, 20)
  }

  function sortCommandsByHistory(commands: Command[]): Command[] {
    const history = commandHistory.value

    if (history.length === 0) {
      return commands
    }

    // Separate commands into recent and others
    const recentCommands: Command[] = []
    const otherCommands: Command[] = []

    // Create a map for quick lookup
    const commandMap = new Map(commands.map(cmd => [cmd.id, cmd]))

    // Add recent commands in order of usage
    for (const commandId of history) {
      const command = commandMap.get(commandId)
      if (command) {
        recentCommands.push(command)
        commandMap.delete(commandId) // Remove from map to avoid duplicates
      }
    }

    // Add remaining commands
    otherCommands.push(...commandMap.values())

    return [...recentCommands, ...otherCommands]
  }

  return {
    trackCommandUsage,
    sortCommandsByHistory,
    commandHistory: readonly(commandHistory),
  }
}
