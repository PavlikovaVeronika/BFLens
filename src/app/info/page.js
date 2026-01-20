export default function Info() {
    return (
        <div className="flex flex-col py-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                About BMFLy
            </h2>
            <div className="flex flex-col p-5 rounded-lg border border-gray-200">
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mt-2 mb-1">General information</h3>
                    <div>
                        <p><span className="font-semibold">Version:</span> 1.0.0</p>
                        <p><span className="font-semibold">Developers:</span> Martin Trnečka, Veronika Pavlíková</p>
                        <p><span className="font-semibold">Institution:</span> Palacký University Olomouc, Department of Computer Science</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mt-2 mb-1">Goal of the Application</h3>
                    <p className="text-gray-700">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mt-2 mb-1">Troubleshooting</h3>
                    <p className="text-gray-700">
                        If the application is not working as expected, try refreshing your browser
                        or ensuring JavaScript is enabled. For persistent issues, contact the developers:{" "}
                        <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
                            support@example.com
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    )

}