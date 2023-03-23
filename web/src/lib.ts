export const formatDate = (d: Date) => d.toLocaleString()

export const formatTimestamp = (t: number) => formatDate(new Date(t))
