export const formatDate = (d: Date) => d.toLocaleDateString()

export const formatTimestamp = (t: number) => formatDate(new Date(t))
