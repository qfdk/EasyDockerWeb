var data = {
    "read": "2018-08-23T05:52:42.619175318Z",
    "preread": "2018-08-23T05:52:41.615285022Z",
    "pids_stats": {
      "current": 5
    },
    "blkio_stats": {
      "io_service_bytes_recursive": [
        {
          "major": 8,
          "minor": 0,
          "op": "Read",
          "value": 1523712
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Write",
          "value": 0
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Sync",
          "value": 0
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Async",
          "value": 1523712
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Total",
          "value": 1523712
        }
      ],
      "io_serviced_recursive": [
        {
          "major": 8,
          "minor": 0,
          "op": "Read",
          "value": 64
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Write",
          "value": 0
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Sync",
          "value": 0
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Async",
          "value": 64
        },
        {
          "major": 8,
          "minor": 0,
          "op": "Total",
          "value": 64
        }
      ],
      "io_queue_recursive": [
        
      ],
      "io_service_time_recursive": [
        
      ],
      "io_wait_time_recursive": [
        
      ],
      "io_merged_recursive": [
        
      ],
      "io_time_recursive": [
        
      ],
      "sectors_recursive": [
        
      ]
    },
    "num_procs": 0,
    "storage_stats": {
      
    },
    "cpu_stats": {
      "cpu_usage": {
        "total_usage": 4522593724,
        "percpu_usage": [
          4522593724
        ],
        "usage_in_kernelmode": 2140000000,
        "usage_in_usermode": 600000000
      },
      "system_cpu_usage": 3263620000000,
      "online_cpus": 1,
      "throttling_data": {
        "periods": 0,
        "throttled_periods": 0,
        "throttled_time": 0
      }
    },
    "precpu_stats": {
      "cpu_usage": {
        "total_usage": 4521295879,
        "percpu_usage": [
          4521295879
        ],
        "usage_in_kernelmode": 2140000000,
        "usage_in_usermode": 600000000
      },
      "system_cpu_usage": 3262620000000,
      "online_cpus": 1,
      "throttling_data": {
        "periods": 0,
        "throttled_periods": 0,
        "throttled_time": 0
      }
    },
    "memory_stats": {
      "usage": 3543040,
      "max_usage": 3624960,
      "stats": {
        "active_anon": 1515520,
        "active_file": 172032,
        "cache": 1523712,
        "dirty": 0,
        "hierarchical_memory_limit": 9.2233720368548e+18,
        "hierarchical_memsw_limit": 9.2233720368548e+18,
        "inactive_anon": 0,
        "inactive_file": 1351680,
        "mapped_file": 1130496,
        "pgfault": 2218,
        "pgmajfault": 13,
        "pgpgin": 1856,
        "pgpgout": 1114,
        "rss": 1515520,
        "rss_huge": 0,
        "total_active_anon": 1515520,
        "total_active_file": 172032,
        "total_cache": 1523712,
        "total_dirty": 0,
        "total_inactive_anon": 0,
        "total_inactive_file": 1351680,
        "total_mapped_file": 1130496,
        "total_pgfault": 2218,
        "total_pgmajfault": 13,
        "total_pgpgin": 1856,
        "total_pgpgout": 1114,
        "total_rss": 1515520,
        "total_rss_huge": 0,
        "total_unevictable": 0,
        "total_writeback": 0,
        "unevictable": 0,
        "writeback": 0
      },
      "limit": 1040814080
    },
    "name": "\/redis",
    "id": "88cdf8eee791daef6c5e3f16189d53e47434910eedb2abaf1c80ceae8d7b7b6d",
    "networks": {
      "eth0": {
        "rx_bytes": 1528,
        "rx_packets": 20,
        "rx_errors": 0,
        "rx_dropped": 0,
        "tx_bytes": 0,
        "tx_packets": 0,
        "tx_errors": 0,
        "tx_dropped": 0
      }
    }
  }

function calculateCPUPercentUnix(json) {
    var previousCPU = json.precpu_stats.cpu_usage.total_usage;
    var previousSystem = data.precpu_stats.system_cpu_usage;
    var cpuPercent = 0.0
    // calculate the change for the cpu usage of the container in between readings
    var cpuDelta = parseInt(json.cpu_stats.cpu_usage.total_usage) - parseInt(previousCPU)
    // calculate the change for the entire system between readings
    var systemDelta = parseInt(json.cpu_stats.system_cpu_usage) - parseInt(previousSystem)
    if (systemDelta > 0.0 && cpuDelta > 0.0) {
        cpuPercent = (cpuDelta / systemDelta) * parseInt(data.cpu_stats.cpu_usage.percpu_usage.length) * 100.0
    }
    return cpuPercent
}

calculateCPUPercentUnix(data);