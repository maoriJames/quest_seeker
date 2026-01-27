export const profileKeys = {
  all: ['profiles'] as const,
  byId: (id: string) => ['profiles', id] as const,
  current: ['profiles', 'current'] as const,
}
