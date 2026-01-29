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
                        <p><span className="font-semibold">Developers:</span> Veronika Pavlíková, Martin Trnečka</p>
                        <p><span className="font-semibold">Institution:</span> Palacký University Olomouc, Department of Computer Science</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-xl font-semibold mt-2 mb-1">Goal of the Application</h3>
                    <p className="text-gray-700">
                        The goal of the BMFLy web application is to visualize the results of Boolean matrix factorization (BMF) and simplify the interpretation of factors. The user has several graphs available that visualize factors with respect to different parameters such as overlap with the original data or their similarity.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mt-2 mb-1">Troubleshooting</h3>
                    <p className="text-gray-700">
                        If the application is not working as expected, try refreshing your browser
                        or ensuring JavaScript is enabled. For persistent issues, contact the developers:{" "}
                        <a href="mailto:veronika.pavlikova@upol.cz" className="text-blue-600 hover:underline">
                            veronika.pavlikova@upol.com
                        </a>{" "}or{" "}
                        <a href="mailto:martin.trnecka@upol.cz" className="text-blue-600 hover:underline">
                            martin.trnecka@upol.com
                        </a>.
                    </p>
                </div>
            </div>
        </div>
    )

}