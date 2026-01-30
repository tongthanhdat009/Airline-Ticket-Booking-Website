function SignUpForm() {
  return (
    <div className="flex flex-col rounded-lg shadow-lg max-w-200 p-6 bg-white opacity-80">
        <h2 className="text-2xl font-bold mb-2 text-center">Register account</h2>
        <form className="flex flex-col">
            <input type="text" placeholder="Họ và tên" className="border p-1 rounded" />
            <div className="text-blue-500 text-sm mb-1">
                <span>Vui lòng nhập họ tên trùng với giấy tờ tùy thân, Ví dụ: nếu tên bạn là Nguyễn Văn A hãy nhập Nguyễn Văn A</span>
            </div>
            <div className="flex gap-2 pb-2">
                <input type="number" placeholder="Số điện thoại" className="border p-1 rounded w-full" />
                <span className="whitespace-nowrap mt-1 mr-2">Ngày sinh: </span>
                <input type="date" className="border p-1 rounded" />
            </div>
            <div className="mb-2">
                <input type="email" placeholder="Email" className="border rounded-t p-1 w-full" />
                <div className="bg-yellow-100 rounded-b pl-2 p-1">Vui lòng nhập email thật để xác nhận tài khoản</div>
            </div>
            <div className="mb-2">
                <input type="password" placeholder="Password" className="border p-1 rounded w-full" />
            </div>
            <button 
                type="submit" 
                className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded px-16 py-2 self-center mb-2 transition-all duration-300"
            >
                Confirm
            </button>
            <span className="text-gray-600 text-xl text-center mb-2 pt-20">Nếu bạn đã có tài khoản!</span>
            <button 
                type="button" 
                className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded px-14 py-2 self-center mb-2 transition-all duration-300"
            >
                Login
            </button>
        </form>
    </div>
  )
}
export default SignUpForm