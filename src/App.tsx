import { useState } from 'react'
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

// シフトデータの型定義
interface ShiftItem {
  id: number
  text: string
  date: string
  category: string
  completed: boolean
}

// 今日の日付を YYYY-MM-DD 形式で取得する関数
const getTodayString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function App() {
  const [inputText, setInputText] = useState('')
  const [category, setCategory] = useState('早番')
  const [selectedDate, setSelectedDate] = useState(getTodayString())

  // 初期データ
  const [shifts, setShifts] = useState<ShiftItem[]>([
    { id: 1, text: 'コンビニ (09:00 - 17:00)', date: getTodayString(), category: '早番', completed: false },
    { id: 2, text: '居酒屋 (18:00 - 23:00)', date: getTodayString(), category: '遅番', completed: false },
  ])

  // 通知ステート
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // 削除確認ダイアログのステート
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)

  // シフト追加処理
  const handleAddShift = () => {
    if (inputText.trim() === '') return
    const newShift: ShiftItem = {
      id: Date.now(),
      text: inputText,
      date: selectedDate || getTodayString(),
      category: category,
      completed: false,
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

  // 削除モーダルを開く
  const handleOpenDeleteDialog = (id: number) => {
    setDeleteTargetId(id)
  }

  // 削除モーダルを閉じる
  const handleCloseDeleteDialog = () => {
    setDeleteTargetId(null)
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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // カテゴリごとのバッジカラー設定（見やすい高コントラスト配色）
  const getCategoryChip = (cat: string) => {
    switch (cat) {
      case '早番':
        return (
          <Chip
            label="早番"
            size="small"
            sx={{
              bgcolor: '#e0f2fe',
              color: '#0369a1',
              fontWeight: 'bold',
              mr: 1,
            }}
          />
        )
      case '遅番':
        return (
          <Chip
            label="遅番"
            size="small"
            sx={{
              bgcolor: '#ffedd5',
              color: '#c2410c',
              fontWeight: 'bold',
              mr: 1,
            }}
          />
        )
      case '夜勤':
        return (
          <Chip
            label="夜勤"
            size="small"
            sx={{
              bgcolor: '#f3e8ff',
              color: '#7e22ce',
              fontWeight: 'bold',
              mr: 1,
            }}
          />
        )
      default:
        return <Chip label={cat} size="small" sx={{ mr: 1 }} />
    }
  }

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen pb-12">
      {/* ヘッダー */}
      <AppBar position="static" elevation={0} sx={{ mb: 4, bgcolor: '#1e293b' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            バイトシフト管理 App
          </Typography>
          <Tooltip title="ログインユーザー: 田中 太郎">
            <Avatar sx={{ bgcolor: '#0284c7', width: 36, height: 36, fontSize: 14, fontWeight: 'bold' }}>
              田
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        {/* シフト入力エリア */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            color: 'text.primary',
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#334155' }}>
            新しいシフトを登録
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="勤務メモ（例: コンビニ 9:00-17:00）"
              variant="outlined"
              fullWidth
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {/* 日付選択フォーム */}
              <TextField
                label="勤務日"
                type="date"
                variant="outlined"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                sx={{ flex: 1 }}
              />

              {/* シフト区分フォーム */}
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

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleAddShift}
              sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, py: 1.2, fontWeight: 'bold' }}
            >
              シフトを登録
            </Button>
          </Stack>
        </Paper>

        <Divider sx={{ my: 4, borderColor: '#cbd5e1' }}>
          <Badge badgeContent={shifts.length} color="primary" sx={{ px: 1 }}>
            <Typography variant="subtitle1" component="span" sx={{ color: '#475569', fontWeight: 'bold' }}>
              登録シフト一覧
            </Typography>
          </Badge>
        </Divider>

        {/* シフト一覧エリア */}
        {shifts.length === 0 ? (
          <Alert severity="info" sx={{ width: '100%', borderRadius: 2 }}>
            登録されているシフトはありません。上のフォームから登録してください。
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
              {shifts.map((shift, index) => (
                <ListItem
                  key={shift.id}
                  divider={index < shifts.length - 1}
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
                    sx={{
                      textDecoration: shift.completed ? 'line-through' : 'none',
                      color: shift.completed ? '#94a3b8' : '#1e293b',
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
                  {/* 区分バッジ表示 */}
                  {getCategoryChip(shift.category)}
                  <Tooltip title="このシフトを削除">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(shift.id)}
                      sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fef2f2' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* 削除確認モーダル */}
        <Dialog open={deleteTargetId !== null} onClose={handleCloseDeleteDialog}>
          <DialogTitle sx={{ fontWeight: 'bold', color: '#0f172a' }}>シフトの削除確認</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#475569' }}>
              本当にこのシフトを削除してもよろしいですか？この操作は取り消せません。
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseDeleteDialog} sx={{ color: '#64748b' }}>
              キャンセル
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disableElevation
              sx={{ fontWeight: 'bold' }}
            >
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