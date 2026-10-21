import { useState, useEffect } from 'react'
import './App.css'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SearchIcon from '@mui/icons-material/Search'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import DownloadIcon from '@mui/icons-material/Download'
import FlashOnIcon from '@mui/icons-material/FlashOn'
import CalculateIcon from '@mui/icons-material/Calculate'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Badge from '@mui/material/Badge'
import Alert from '@mui/material/Alert'
import Tooltip from '@mui/material/Tooltip'
import Snackbar from '@mui/material/Snackbar'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PaymentsIcon from '@mui/icons-material/Payments'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// シフトデータの型定義
interface ShiftItem {
  id: number
  text: string
  date: string
  category: string
  completed: boolean
  hours: number
  breakMinutes: number
  hourlyRate: number
  transportFee: number
}

// 今日の日付を YYYY-MM-DD 形式で取得
const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 今年月を YYYY-MM 形式で取得
const getCurrentMonthString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// 実働時間の計算（拘束時間 - 休憩時間）
const calculateNetHours = (hours: number, breakMinutes: number) => {
  return Math.max(0, hours - (breakMinutes || 0) / 60)
}

// 実働給与の計算（実働時間 × 時給）
const calculatePay = (hours: number, breakMinutes: number, hourlyRate: number) => {
  const netHours = calculateNetHours(hours, breakMinutes)
  return Math.round(netHours * (hourlyRate || 0))
}

function App() {
  // メイン画面切り替えタブ（'calendar': カレンダー, 'shifts': シフト登録・一覧, 'payroll': 給与計算）
  const [mainTab, setMainTab] = useState<'calendar' | 'shifts' | 'payroll'>('calendar')

  // カレンダー表示用の年月ステート
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [inputText, setInputText] = useState('')
  const [category, setCategory] = useState('早番')
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [hours, setHours] = useState<number>(8)
  const [breakMinutes, setBreakMinutes] = useState<number>(60)
  const [hourlyRate, setHourlyRate] = useState<number>(1100)
  const [transportFee, setTransportFee] = useState<number>(500)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString())
  const [searchQuery, setSearchQuery] = useState('')

  // localStorage からデータロード
  const [shifts, setShifts] = useState<ShiftItem[]>(() => {
    const saved = localStorage.getItem('shift_app_data')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map((item: any) => ({
          ...item,
          hours: item.hours ?? 8,
          breakMinutes: item.breakMinutes ?? 60,
          hourlyRate: item.hourlyRate ?? 1100,
          transportFee: item.transportFee ?? 500,
        }))
      } catch (e) {
        console.error('localStorage の読み込みエラー', e)
      }
    }
    return [
      { id: 1, text: 'コンビニ', date: getTodayString(), category: '早番', completed: false, hours: 8, breakMinutes: 60, hourlyRate: 1100, transportFee: 500 },
      { id: 2, text: '居酒屋', date: getTodayString(), category: '遅番', completed: false, hours: 5, breakMinutes: 30, hourlyRate: 1200, transportFee: 400 },
    ]
  })

  // 編集ダイアログ用のステート
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null)
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategory, setEditCategory] = useState('早番')
  const [editHours, setEditHours] = useState<number>(8)
  const [editBreakMinutes, setEditBreakMinutes] = useState<number>(60)
  const [editHourlyRate, setEditHourlyRate] = useState<number>(1100)
  const [editTransportFee, setEditTransportFee] = useState<number>(500)

  // 削除ダイアログ用のステート
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  // 通知ステート
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // shifts 変更時に localStorage へ自動保存
  useEffect(() => {
    localStorage.setItem('shift_app_data', JSON.stringify(shifts))
  }, [shifts])

  // カレンダーの日付クリック時の処理（日付選択 ＆ シフト管理タブへジャンプ）
  const handleCalendarDateClick = (dateStr: string) => {
    setSelectedDate(dateStr)
    setMainTab('shifts')
    setSnackbarMessage(`${dateStr} の登録画面へ移動しました`)
    setOpenSnackbar(true)
  }

  // 簡単プリセット入力
  const applyPreset = (type: '早番' | '遅番' | '夜勤') => {
    setCategory(type)
    if (type === '早番') {
      setHours(8)
      setBreakMinutes(60)
      setHourlyRate(1100)
    } else if (type === '遅番') {
      setHours(5)
      setBreakMinutes(30)
      setHourlyRate(1200)
    } else if (type === '夜勤') {
      setHours(7)
      setBreakMinutes(60)
      setHourlyRate(1400)
    }
    setSnackbarMessage(`${type}の条件を自動セットしました`)
    setOpenSnackbar(true)
  }

  // シフト追加処理
  const handleAddShift = () => {
    if (inputText.trim() === '') return
    const newShift: ShiftItem = {
      id: Date.now(),
      text: inputText,
      date: selectedDate || getTodayString(),
      category: category,
      completed: false,
      hours: Number(hours) || 0,
      breakMinutes: Number(breakMinutes) || 0,
      hourlyRate: Number(hourlyRate) || 0,
      transportFee: Number(transportFee) || 0,
    }
    setShifts([...shifts, newShift])
    setInputText('')
    setSnackbarMessage('新しいシフトを登録しました！')
    setOpenSnackbar(true)
  }

  // 完了状態の切り替え処理
  const handleToggleComplete = (id: number) => {
    setShifts(
      shifts.map((shift) =>
        shift.id === id ? { ...shift, completed: !shift.completed } : shift
      )
    )
  }

  // 編集モーダルを開く
  const handleOpenEditDialog = (shift: ShiftItem) => {
    setEditingShift(shift)
    setEditText(shift.text)
    setEditDate(shift.date)
    setEditCategory(shift.category)
    setEditHours(shift.hours || 8)
    setEditBreakMinutes(shift.breakMinutes || 0)
    setEditHourlyRate(shift.hourlyRate || 1100)
    setEditTransportFee(shift.transportFee || 0)
  }

  // 編集の保存実行
  const handleSaveEdit = () => {
    if (!editingShift || editText.trim() === '') return
    setShifts(
      shifts.map((s) =>
        s.id === editingShift.id
          ? {
              ...s,
              text: editText,
              date: editDate,
              category: editCategory,
              hours: Number(editHours) || 0,
              breakMinutes: Number(editBreakMinutes) || 0,
              hourlyRate: Number(editHourlyRate) || 0,
              transportFee: Number(editTransportFee) || 0,
            }
          : s
      )
    )
    setEditingShift(null)
    setSnackbarMessage('シフト情報を更新しました！')
    setOpenSnackbar(true)
  }

  // 削除モーダルを開く
  const handleOpenDeleteDialog = (id: number) => {
    setDeleteTargetId(id)
  }

  // 削除の実行
  const handleConfirmDelete = () => {
    if (deleteTargetId !== null) {
      setShifts(shifts.filter((shift) => shift.id !== deleteTargetId))
      setSnackbarMessage('シフトを削除しました')
      setOpenSnackbar(true)
      setDeleteTargetId(null)
    }
  }

  // 完了済みシフトの一括削除
  const handleClearCompleted = () => {
    const activeShifts = shifts.filter((s) => !s.completed)
    setShifts(activeShifts)
    setSnackbarMessage('完了済みのシフトをすべて削除しました')
    setOpenSnackbar(true)
  }

  // CSVダウンロード処理
  const handleExportCSV = () => {
    if (shifts.length === 0) return
    const header = '日付,シフト区分,勤務メモ,拘束時間(h),休憩(分),時給(円),交通費(円),概算給与(円),ステータス\n'
    const rows = shifts
      .map((s) => {
        const pay = calculatePay(s.hours, s.breakMinutes, s.hourlyRate)
        return `"${s.date}","${s.category}","${s.text.replace(/"/g, '""')}",${s.hours},${s.breakMinutes || 0},${s.hourlyRate},${s.transportFee || 0},${pay},"${s.completed ? '完了' : '未完了'}"`
      })
      .join('\n')

    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `シフト一覧_${getTodayString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setSnackbarMessage('CSVファイルを保存しました！')
    setOpenSnackbar(true)
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // カテゴリごとのバッジカラー設定
  const getCategoryChip = (cat: string) => {
    switch (cat) {
      case '早番':
        return <Chip label="早番" size="small" sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', mr: 0.5 }} />
      case '遅番':
        return <Chip label="遅番" size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 'bold', mr: 0.5 }} />
      case '夜勤':
        return <Chip label="夜勤" size="small" sx={{ bgcolor: '#f3e8ff', color: '#7e22ce', fontWeight: 'bold', mr: 0.5 }} />
      default:
        return <Chip label={cat} size="small" sx={{ mr: 0.5 }} />
    }
  }

  // 月別フィルター用の月リスト抽出
  const monthOptions = Array.from(
    new Set(shifts.map((s) => s.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a))

  if (!monthOptions.includes(getCurrentMonthString())) {
    monthOptions.unshift(getCurrentMonthString())
  }

  // 選択月の対象シフト群
  const targetMonthShifts = shifts.filter((s) =>
    selectedMonth === 'all' ? true : s.date.startsWith(selectedMonth)
  )

  // 月別 ＆ 完了タブ ＆ 検索 ＆ 日付昇順ソート
  const filteredShifts = targetMonthShifts
    .filter((shift) => {
      if (filter === 'active') return !shift.completed
      if (filter === 'completed') return shift.completed
      return true
    })
    .filter((shift) =>
      shift.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.date.includes(searchQuery) ||
      shift.category.includes(searchQuery)
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  // 給与・交通費集計データ
  const totalWage = targetMonthShifts.reduce((sum, s) => sum + calculatePay(s.hours, s.breakMinutes, s.hourlyRate), 0)
  const totalTransport = targetMonthShifts.reduce((sum, s) => sum + (s.transportFee || 0), 0)
  const grandTotal = totalWage + totalTransport
  const completedWage = targetMonthShifts
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + calculatePay(s.hours, s.breakMinutes, s.hourlyRate) + (s.transportFee || 0), 0)

  // 区分ごとの集計
  const getCategoryStats = (catName: string) => {
    const list = targetMonthShifts.filter((s) => s.category === catName)
    const count = list.length
    const totalHours = list.reduce((sum, s) => sum + calculateNetHours(s.hours, s.breakMinutes), 0)
    const totalPay = list.reduce((sum, s) => sum + calculatePay(s.hours, s.breakMinutes, s.hourlyRate), 0)
    return { count, totalHours, totalPay }
  }

  // --- カレンダー描画用ロジック ---
  const calYear = currentCalendarDate.getFullYear()
  const calMonth = currentCalendarDate.getMonth() // 0-indexed

  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentCalendarDate(new Date(calYear, calMonth - 1, 1))
  }
  const nextMonth = () => {
    setCurrentCalendarDate(new Date(calYear, calMonth + 1, 1))
  }
  const goToday = () => {
    const today = new Date()
    setCurrentCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // カレンダーマスの生成
  const calendarCells = []
  // 前月埋め
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null)
  }
  // 当月の日付
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day)
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen pb-12">
      {/* ヘッダー */}
      <AppBar position="static" elevation={0} sx={{ mb: 3, bgcolor: '#1e293b' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            バイトシフト管理 App
          </Typography>
          <Tooltip title="CSVダウンロード">
            <IconButton color="inherit" onClick={handleExportCSV} sx={{ mr: 1 }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ログインユーザー: 田中 太郎">
            <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
              田
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        {/* メイン画面切替タブ */}
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', p: 0.5, bgcolor: '#f8fafc' }}>
          <Tabs
            value={mainTab}
            onChange={(_, newValue) => setMainTab(newValue)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<CalendarMonthIcon />}
              iconPosition="start"
              label="カレンダー"
              value="calendar"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab
              icon={<EditCalendarIcon />}
              iconPosition="start"
              label="シフト管理"
              value="shifts"
              sx={{ fontWeight: 'bold' }}
            />
            <Tab
              icon={<CalculateIcon />}
              iconPosition="start"
              label="給与計算"
              value="payroll"
              sx={{ fontWeight: 'bold' }}
            />
          </Tabs>
        </Paper>

        {/* タブ 1: カレンダー表示画面 */}
        {mainTab === 'calendar' && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            {/* カレンダーコントロールバー */}
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                {calYear}年 {calMonth + 1}月
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Button size="small" variant="outlined" onClick={goToday} sx={{ borderRadius: 2, py: 0.2 }}>
                  今月
                </Button>
                <IconButton size="small" onClick={prevMonth} sx={{ border: '1px solid #cbd5e1' }}>
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={nextMonth} sx={{ border: '1px solid #cbd5e1' }}>
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* 曜日ヘッダー */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1, textAlign: 'center' }}>
              {weekDays.map((wd, i) => (
                <Typography
                  key={wd}
                  variant="caption"
                  sx={{
                    fontWeight: 'bold',
                    color: i === 0 ? '#ef4444' : i === 6 ? '#2563eb' : '#64748b',
                    py: 0.5,
                    bgcolor: '#f8fafc',
                    borderRadius: 1,
                  }}
                >
                  {wd}
                </Typography>
              ))}
            </Box>

            {/* カレンダーグリッド */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.8 }}>
              {calendarCells.map((dayNum, idx) => {
                if (dayNum === null) {
                  return <Box key={`empty-${idx}`} sx={{ minHeight: 70, bgcolor: '#fafafa', borderRadius: 1.5 }} />
                }

                const dayString = String(dayNum).padStart(2, '0')
                const monthString = String(calMonth + 1).padStart(2, '0')
                const fullDateStr = `${calYear}-${monthString}-${dayString}`
                const dayShifts = shifts.filter((s) => s.date === fullDateStr)
                const isToday = fullDateStr === getTodayString()

                return (
                  <Box
                    key={fullDateStr}
                    onClick={() => handleCalendarDateClick(fullDateStr)}
                    sx={{
                      minHeight: 72,
                      p: 0.5,
                      border: isToday ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      bgcolor: isToday ? '#f0f9ff' : 'white',
                      borderRadius: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isToday ? '#e0f2fe' : '#f8fafc',
                        borderColor: '#0284c7',
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 'bold',
                        color: isToday ? '#0284c7' : '#334155',
                        mb: 0.3,
                        fontSize: 11,
                      }}
                    >
                      {dayNum}
                    </Typography>

                    <Stack spacing={0.3} sx={{ overflowY: 'auto', flex: 1 }}>
                      {dayShifts.map((s) => (
                        <Box
                          key={s.id}
                          onClick={(e) => {
                            e.stopPropagation() // 親セルのクリック（登録画面へジャンプ）を止め、編集モーダルを開く
                            handleOpenEditDialog(s)
                          }}
                          sx={{
                            cursor: 'pointer',
                            p: 0.3,
                            px: 0.5,
                            borderRadius: 1,
                            bgcolor: s.completed ? '#f1f5f9' : '#eff6ff',
                            borderLeft: `3px solid ${
                              s.category === '早番' ? '#0284c7' : s.category === '遅番' ? '#f97316' : '#9333ea'
                            }`,
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          <Typography
                            noWrap
                            variant="caption"
                            sx={{
                              fontSize: 9,
                              fontWeight: 'bold',
                              display: 'block',
                              color: s.completed ? '#94a3b8' : '#1e293b',
                              textDecoration: s.completed ? 'line-through' : 'none',
                            }}
                          >
                            {s.text}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: 8, color: '#64748b' }}>
                            {s.hours}h (¥{calculatePay(s.hours, s.breakMinutes, s.hourlyRate).toLocaleString()})
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )
              })}
            </Box>
          </Paper>
        )}

        {/* タブ 2: シフト管理画面 */}
        {mainTab === 'shifts' && (
          <>
            {/* 月切り替えヘッダーバー */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2.5,
                mb: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                  対象月を選択:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ fontSize: 13, height: 36 }}
                  >
                    <MenuItem value="all">全期間</MenuItem>
                    {monthOptions.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m.replace('-', '年')}月
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* シフト入力エリア */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                color: 'text.primary',
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                mb: 3,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, color: '#334155' }}>
                新しいシフトを登録
              </Typography>

              {/* ワンクリックプリセットボタン */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FlashOnIcon />}
                  onClick={() => applyPreset('早番')}
                  sx={{ borderRadius: 2, fontSize: 12, py: 0.3 }}
                >
                  早番セット
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="warning"
                  startIcon={<FlashOnIcon />}
                  onClick={() => applyPreset('遅番')}
                  sx={{ borderRadius: 2, fontSize: 12, py: 0.3 }}
                >
                  遅番セット
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<FlashOnIcon />}
                  onClick={() => applyPreset('夜勤')}
                  sx={{ borderRadius: 2, fontSize: 12, py: 0.3 }}
                >
                  夜勤セット
                </Button>
              </Stack>

              <Stack spacing={2}>
                <TextField
                  label="勤務メモ（例: コンビニ）"
                  variant="outlined"
                  fullWidth
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="勤務日"
                    type="date"
                    variant="outlined"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    sx={{ flex: 1 }}
                  />

                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel id="category-label">シフト区分</InputLabel>
                    <Select
                      labelId="category-label"
                      value={category}
                      label="シフト区分"
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <MenuItem value="早番">早番</MenuItem>
                      <MenuItem value="遅番">遅番</MenuItem>
                      <MenuItem value="夜勤">夜勤</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="拘束時間 (h)"
                    type="number"
                    variant="outlined"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="休憩時間 (分)"
                    type="number"
                    variant="outlined"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="時給 (円)"
                    type="number"
                    variant="outlined"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="交通費 (円)"
                    type="number"
                    variant="outlined"
                    value={transportFee}
                    onChange={(e) => setTransportFee(Number(e.target.value))}
                    sx={{ flex: 1 }}
                  />
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleAddShift}
                  sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, py: 1.2, fontWeight: 'bold' }}
                >
                  シフトを登録 (見込: ¥{(calculatePay(hours, breakMinutes, hourlyRate) + Number(transportFee)).toLocaleString()})
                </Button>
              </Stack>
            </Paper>

            <Divider sx={{ my: 3, borderColor: '#cbd5e1' }}>
              <Badge badgeContent={filteredShifts.length} color="primary" sx={{ px: 1 }}>
                <Typography variant="subtitle1" component="span" sx={{ color: '#475569', fontWeight: 'bold' }}>
                  登録シフト一覧
                </Typography>
              </Badge>
            </Divider>

            {/* 検索バー */}
            <TextField
              placeholder="キーワード・日付でシフトを検索..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2, bgcolor: 'white', borderRadius: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* 絞り込みフィルタータブ */}
            <Paper elevation={0} sx={{ mb: 2, borderRadius: 2, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Tabs
                value={filter}
                onChange={(_, newValue) => setFilter(newValue)}
                variant="fullWidth"
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label={`すべて (${targetMonthShifts.length})`} value="all" sx={{ fontWeight: 'bold' }} />
                <Tab
                  label={`予定 (${targetMonthShifts.filter((s) => !s.completed).length})`}
                  value="active"
                  sx={{ fontWeight: 'bold' }}
                />
                <Tab
                  label={`完了 (${targetMonthShifts.filter((s) => s.completed).length})`}
                  value="completed"
                  sx={{ fontWeight: 'bold' }}
                />
              </Tabs>
            </Paper>

            {/* シフト一覧エリア */}
            {filteredShifts.length === 0 ? (
              <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
                該当するシフトがありません。
              </Alert>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <List disablePadding>
                  {filteredShifts.map((shift, index) => {
                    const shiftPay = calculatePay(shift.hours, shift.breakMinutes, shift.hourlyRate)
                    const totalItemPay = shiftPay + (shift.transportFee || 0)
                    return (
                      <ListItem
                        key={shift.id}
                        divider={index < filteredShifts.length - 1}
                        sx={{
                          py: 1.5,
                          bgcolor: shift.completed ? '#f8fafc' : 'white',
                        }}
                      >
                        <Checkbox
                          edge="start"
                          checked={shift.completed}
                          onChange={() => handleToggleComplete(shift.id)}
                          sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#16a34a' } }}
                        />
                        <ListItemText
                          primary={shift.text}
                          secondary={`実働${calculateNetHours(shift.hours, shift.breakMinutes)}h (休憩${shift.breakMinutes || 0}m) | 交通費¥${shift.transportFee || 0}`}
                          sx={{
                            textDecoration: shift.completed ? 'line-through' : 'none',
                            color: shift.completed ? '#94a3b8' : '#1e293b',
                          }}
                        />

                        {/* 給与バッジ表示 */}
                        <Chip
                          icon={<PaymentsIcon sx={{ fontSize: 13, color: '#15803d' }} />}
                          label={`¥${totalItemPay.toLocaleString()}`}
                          size="small"
                          sx={{
                            mr: 1,
                            bgcolor: '#f0fdf4',
                            color: '#15803d',
                            border: '1px solid #bbf7d0',
                            fontWeight: 'bold',
                          }}
                        />

                        {/* 日付バッジ表示 */}
                        <Chip
                          icon={<CalendarTodayIcon sx={{ fontSize: 13, color: '#64748b' }} />}
                          label={shift.date}
                          size="small"
                          sx={{
                            mr: 1,
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                            fontWeight: 500,
                          }}
                        />

                        {getCategoryChip(shift.category)}

                        {/* 編集ボタン */}
                        <Tooltip title="このシフトを編集">
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            onClick={() => handleOpenEditDialog(shift)}
                            sx={{ color: '#64748b', mr: 0.5, '&:hover': { bgcolor: '#f1f5f9' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* 削除ボタン */}
                        <Tooltip title="このシフトを削除">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(shift.id)}
                            sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                    )
                  })}
                </List>
              </Paper>
            )}

            {/* 完了済み一括削除 & CSVダウンロードボタン */}
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                sx={{ borderRadius: 2 }}
              >
                CSV保存
              </Button>

              {shifts.filter((s) => s.completed).length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearCompleted}
                  sx={{ borderRadius: 2 }}
                >
                  完了一括削除 ({shifts.filter((s) => s.completed).length})
                </Button>
              )}
            </Stack>
          </>
        )}

        {/* タブ 3: 給与計算・集計詳細画面 */}
        {mainTab === 'payroll' && (
          <Stack spacing={3}>
            {/* 月切り替えヘッダーバー */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2.5,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
              }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                  対象月を選択:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    sx={{ fontSize: 13, height: 36 }}
                  >
                    <MenuItem value="all">全期間</MenuItem>
                    {monthOptions.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m.replace('-', '年')}月
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* 給与・交通費サマリーカード */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                💰 給与 ＆ 交通費の月間集計サマリー
              </Typography>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-around', mb: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">給与小計</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                    ¥{totalWage.toLocaleString()}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">交通費合計</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#059669' }}>
                    ¥{totalTransport.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#334155' }}>
                  支給見込総額 (給与 + 交通費):
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#7c3aed' }}>
                  ¥{grandTotal.toLocaleString()}
                </Typography>
              </Stack>

              <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#166534' }}>
                    確定給与 (完了済みシフト分)
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#15803d' }}>
                    ¥{completedWage.toLocaleString()}
                  </Typography>
                </Stack>
              </Box>
            </Paper>

            {/* シフト区分（早番・遅番・夜勤）ごとの内訳集計 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #e2e8f0',
                bgcolor: 'white',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
                📊 シフト区分別内訳
              </Typography>

              <TableContainer sx={{ border: '1px solid #f1f5f9', borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>区分</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>回数</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>実働時間</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>給与合計</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['早番', '遅番', '夜勤'].map((catName) => {
                      const stat = getCategoryStats(catName)
                      return (
                        <TableRow key={catName}>
                          <TableCell component="th" scope="row">
                            {getCategoryChip(catName)}
                          </TableCell>
                          <TableCell align="right">{stat.count} 回</TableCell>
                          <TableCell align="right">{stat.totalHours} h</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                            ¥{stat.totalPay.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}

        {/* 編集ダイアログ */}
        <Dialog open={editingShift !== null} onClose={() => setEditingShift(null)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 'bold' }}>シフト情報の編集</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="勤務メモ"
                fullWidth
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <TextField
                label="勤務日"
                type="date"
                fullWidth
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel id="edit-category-label">シフト区分</InputLabel>
                <Select
                  labelId="edit-category-label"
                  value={editCategory}
                  label="シフト区分"
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <MenuItem value="早番">早番</MenuItem>
                  <MenuItem value="遅番">遅番</MenuItem>
                  <MenuItem value="夜勤">夜勤</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="拘束時間 (h)"
                  type="number"
                  fullWidth
                  value={editHours}
                  onChange={(e) => setEditHours(Number(e.target.value))}
                />
                <TextField
                  label="休憩時間 (分)"
                  type="number"
                  fullWidth
                  value={editBreakMinutes}
                  onChange={(e) => setEditBreakMinutes(Number(e.target.value))}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="時給 (円)"
                  type="number"
                  fullWidth
                  value={editHourlyRate}
                  onChange={(e) => setEditHourlyRate(Number(e.target.value))}
                />
                <TextField
                  label="交通費 (円)"
                  type="number"
                  fullWidth
                  value={editTransportFee}
                  onChange={(e) => setEditTransportFee(Number(e.target.value))}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditingShift(null)}>キャンセル</Button>
            <Button onClick={handleSaveEdit} variant="contained" sx={{ fontWeight: 'bold' }}>
              保存する
            </Button>
          </DialogActions>
        </Dialog>

        {/* 削除確認モーダル */}
        <Dialog open={deleteTargetId !== null} onClose={() => setDeleteTargetId(null)}>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a' }}>シフトの削除確認</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#475569' }}>
              本当にこのシフトを削除してもよろしいですか？この操作は取り消せません。
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteTargetId(null)} sx={{ color: '#64748b' }}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" disableElevation sx={{ fontWeight: 'bold' }}>
              削除する
            </Button>
          </DialogActions>
        </Dialog>

        {/* 通知スナックバー */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
        />
      </Container>
    </div>
  )
}

export default App