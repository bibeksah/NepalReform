/**
 * Performance monitoring utilities for Nepal Reforms Platform
 * Tracks cache performance, load times, and storage usage
 */

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, any> = new Map()

  private constructor() {
    this.initialize()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initialize() {
    if (typeof window === 'undefined') return
    this.monitorPageLoad()
    this.monitorStorage()
    this.monitorNetwork()
    this.monitorCachePerformance()
  }

  private monitorPageLoad() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (perfData) {
          const loadTime = perfData.loadEventEnd - perfData.fetchStart
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart
          const timeToFirstByte = perfData.responseStart - perfData.fetchStart
          this.metrics.set('pageLoadTime', loadTime)
          this.metrics.set('domContentLoaded', domContentLoaded)
          this.metrics.set('timeToFirstByte', timeToFirstByte)
          this.reportMetrics({ type: 'page_load', loadTime, domContentLoaded, timeToFirstByte })
        }
      })
    }
  }

  private async monitorStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const percentUsed = quota > 0 ? (usage / quota) * 100 : 0
        this.metrics.set('storageUsage', usage)
        this.metrics.set('storageQuota', quota)
        this.metrics.set('storagePercent', percentUsed)
      } catch (error) {
        console.error('Error estimating storage:', error)
      }
    }
  }

  private monitorNetwork() {
    if (typeof window !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        const updateNetworkInfo = () => {
          this.metrics.set('networkType', connection.effectiveType)
          this.metrics.set('networkSpeed', connection.downlink)
          this.metrics.set('networkRtt', connection.rtt)
        }
        updateNetworkInfo()
        connection.addEventListener('change', updateNetworkInfo)
      }
    }

    window.addEventListener('online', () => {
      this.metrics.set('isOnline', true)
    })

    window.addEventListener('offline', () => {
      this.metrics.set('isOnline', false)
    })
  }

  private monitorCachePerformance() {
    const originalFetch = window.fetch.bind(window)
    let cacheHits = 0
    let cacheMisses = 0

    window.fetch = (async (...args: Parameters<typeof fetch>) => {
      const startTime = performance.now()
      try {
        const response = await originalFetch(...args)
        const duration = performance.now() - startTime
        const fromCache = duration < 50
        if (fromCache) cacheHits++
        else cacheMisses++
        const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100
        this.metrics.set('cacheHitRate', hitRate)
        this.metrics.set('cacheHits', cacheHits)
        this.metrics.set('cacheMisses', cacheMisses)
        return response
      } catch (error) {
        cacheMisses++
        throw error
      }
    }) as typeof fetch
  }

  trackMetric(name: string, value: any) {
    this.metrics.set(name, value)
  }

  startTiming(label: string) {
    performance.mark(`${label}-start`)
  }

  endTiming(label: string) {
    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)
    const measure = performance.getEntriesByName(label)[0]
    if (measure) {
      this.metrics.set(`timing_${label}`, measure.duration)
      return measure.duration
    }
    return 0
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  private reportMetrics(data: any) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance', data)
    }
  }

  logSummary() {
    console.group('Performance Summary')
    const metrics = this.getMetrics()
    if (metrics.pageLoadTime) console.log(`Page Load: ${metrics.pageLoadTime.toFixed(0)}ms`)
    if (metrics.cacheHitRate !== undefined) console.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}% (${metrics.cacheHits} hits, ${metrics.cacheMisses} misses)`)
    if (metrics.storagePercent !== undefined) console.log(`Storage Used: ${metrics.storagePercent.toFixed(1)}%`)
    if (metrics.networkType) console.log(`Network: ${metrics.networkType}`)
    console.groupEnd()
  }
}

if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance()
  ;(window as any).performanceMonitor = monitor
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitor.logSummary()
    }, 2000)
  })
}