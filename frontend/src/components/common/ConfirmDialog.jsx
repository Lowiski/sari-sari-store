import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Working...' : confirmLabel}
          </Button>
        </>
      }
    >
      <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--muted)' }}>{message}</p>
    </Modal>
  );
}
