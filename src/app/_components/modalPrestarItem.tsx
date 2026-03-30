function LoanModal({ itemId, onClose }) {
  const [name, setName] = useState("");

  const loan = api.loan.create.useMutation({
    onSuccess: onClose
  });

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-80 space-y-4">

        <h2 className="font-medium">Prestar item</h2>

        <input
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />

        <button
          onClick={() => loan.mutate({
            itemId,
            borrowerName: name
          })}
          className="w-full border py-2 rounded"
        >
          Confirmar
        </button>

      </div>
    </div>
  );
}