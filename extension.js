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
	let disposable = vscode.commands.registerCommand('extension.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		const grcov_location = "/home/giles/.cargo/bin/grcov";
		const is_release_mode = false;
		const clean_command = "";
		const build_command = "";
		const test_command = "";

		// setup environment
		// std::env::set_var("CARGO_INCREMENTAL", "0");

		// let mut flags = String::from("-Zprofile -Ccodegen-units=1 -Cinline-threshold=0 -Clink-dead-code -Coverflow-checks=off -Zno-landing-pads");
		// let args : Vec<String> = std::env::args().collect();
		// let is_release = args.iter().any(|arg| arg.contains("--release"));

		// if is_release {
		// 	flags.push_str(" -g");
		// }
		// std::env::set_var("RUSTFLAGS", flags);

		// clean
		const pwd = "/home/giles/p/pth/"; //vscode.workspaceFolder.uri.fsPath
		const cp = require('child_process')
		const new_env = {
			"CARGO_INCREMENTAL": "0",
			"RUSTFLAGS": "-Zprofile -Ccodegen-units=1 -Cinline-threshold=0 -Clink-dead-code -Coverflow-checks=off -Zno-landing-pads",
			...process.env
		};

		const options = {
			cwd: pwd,
			stdio: ["ignore", "pipe", "pipe"],
			env: new_env
		};
		cp.exec('cargo clean', options, (err, stdout, stderr) => {
			console.log('stdout: ' + stdout);
			console.log('stderr: ' + stderr);
			if (err) {
				console.log('error: ' + err);
			} else {
				vscode.window.showInformationMessage('Clean!');

				cp.exec('cargo test', options, (err, stdout, stderr) => {
					console.log('stdout: ' + stdout);
					console.log('stderr: ' + stderr);
					if (err) {
						vscode.window.showInformationMessage('Tests ran but some failed');
					}
					cp.exec('mkdir coverage', options, (err, stdout, stderr) => {
						// Ensures it's there!

						cp.exec('/home/giles/.cargo/bin/grcov ./target/debug -t lcov --llvm --branch --ignore-not-existing -o ./coverage/lcov-rust.info',
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

		// run grcov to postprocess output into lcov info format.

		// ensure other extension is installed.


		// Display a message box to the user
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
