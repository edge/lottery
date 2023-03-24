// Copyright (C) 2023 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

export const formatDate = (d: Date) => d.toLocaleDateString()

export const formatTimestamp = (t: number) => formatDate(new Date(t))
