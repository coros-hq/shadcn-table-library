import type { SalesRecord } from './pivot'

const REGIONS = ['North', 'South', 'East', 'West']
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const CHANNELS = ['Online', 'Retail']

const REGION_BASE: Record<string, number> = {
  North: 42000,
  South: 31000,
  East: 55000,
  West: 38000,
}

const QUARTER_GROWTH: Record<string, number> = {
  Q1: 1,
  Q2: 1.08,
  Q3: 0.95,
  Q4: 1.22,
}

const CHANNEL_SPLIT: Record<string, number> = {
  Online: 0.6,
  Retail: 0.4,
}

export const salesData: SalesRecord[] = REGIONS.flatMap((region) =>
  QUARTERS.flatMap((quarter) =>
    CHANNELS.map((channel) => ({
      region,
      quarter,
      channel,
      amount: Math.round(
        REGION_BASE[region] * QUARTER_GROWTH[quarter] * CHANNEL_SPLIT[channel],
      ),
    })),
  ),
)
