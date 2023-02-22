module.exports = function (plop) {
  plop.setGenerator('module', {
    description: 'create module',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'module name please',
      },
    ],
    actions: [
      { type: 'add', path: 'src/{{ dashCase name }}/index.ts', templateFile: '.templates/package-index.hbs' },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/{{ pascalCase name }}Repository.ts',
        templateFile: '.templates/repository.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/{{ pascalCase name }}Controller.ts',
        templateFile: '.templates/controller.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/entities/index.ts',
        templateFile: '.templates/entity-index.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/entities/{{ pascalCase name }}Entity.ts',
        templateFile: '.templates/entity.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/models/index.ts',
        templateFile: '.templates/model-index.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/models/{{ pascalCase name }}.ts',
        templateFile: '.templates/model.hbs',
      },
      {
        type: 'add',
        path: 'src/{{ dashCase name }}/usecases/index.ts',
        templateFile: '.templates/usecase-index.hbs',
      },
    ],
  });
}
