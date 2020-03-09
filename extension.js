// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "rcover" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.generateRustCoverage', function () {
		// The code you place here will be executed every time your command is executed

		const config = vscode.workspace.getConfiguration('rcover');
		const grcov_location = config.has('grcovPath') && config.get('grcovPath');

		const clean_command = config.has('cleanCommand') && config.get('cleanCommand');;
		const test_command = config.has('testCommand') && config.get('testCommand');;

		let is_release = test_command.includes("--release");

		const pwd = vscode.workspace.rootPath;
		const cp = require('child_process')
		const new_env = {
			"CARGO_INCREMENTAL": "0",
			"RUSTFLAGS": "-Zprofile -Ccodegen-units=1 -Cinline-threshold=0 -Clink-dead-code -Coverflow-checks=off -Zno-landing-pads",
			...process.env
		};

		// Coverage won't work without debug info...
		if (is_release && !new_env["RUSTFLAGS"].includes("-g")) {
			new_env["RUSTFLAGS"] = new_env["RUSTFLAGS"] + " -g";
		}

		const options = {
			cwd: pwd,
			stdio: ["ignore", "pipe", "pipe"],
			env: new_env
		};
		//TODO: Javascript promises were invented to avoid the below:
		// Clean to force a rebuild
		cp.exec(clean_command, options, (err, stdout, stderr) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
			} else {
				// Compile with correct flags and run tests...
				cp.exec(test_command, options, (err, stdout, stderr) => {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (err) {
						vscode.window.showInformationMessage('Coverage: Tests ran but some failed');
					}
					// Ensures it's there!
					cp.exec('mkdir coverage', options, (err, stdout, stderr) => {

						// run grcov to postprocess output into lcov info format.
						cp.exec(grcov_location + ' ./target/debug -t lcov --llvm --branch --ignore-not-existing -o ./coverage/lcov-rust.info',
							options, (err, stdout, stderr) => {
								console.log('stdout: ' + stdout);
								console.log('stderr: ' + stderr);

								if (err) {
									vscode.window.showInformationMessage('Could not generate coverage');
								}
							});
					});
				});
			}
		});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
