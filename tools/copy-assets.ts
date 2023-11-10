import * as shell from 'shelljs';

// Copy all the view templates
shell.mkdir('-p', 'dist/dashboard/static/');
shell.cp( '-Rf', 'src/dashboard/static', 'dist/dashboard/' );

// shell.mkdir('-p', 'views');
// shell.cp( '-Rf', 'src/dashboard/static', 'dist/dashboard/' );
