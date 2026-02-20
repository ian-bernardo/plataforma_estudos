type ConfirmDeleteModalProps = {
  itemNome: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteModal({
  itemNome,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="p-8 rounded-2xl border w-[400px] text-center transition"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--foreground)",
        }}
      >
        <h2 className="text-xl font-semibold mb-4">Confirmar Exclusão</h2>

        <p style={{ opacity: 0.7 }} className="mb-6">
          Tem certeza que deseja excluir <br />
          <span className="text-white font-medium">{itemNome}</span>?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-600 rounded-lg hover:bg-zinc-800 transition"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
