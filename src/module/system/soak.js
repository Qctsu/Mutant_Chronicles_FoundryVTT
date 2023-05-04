export default class SoakForm extends FormApplication {
  constructor(object, options = {}) {
    super(object.data, options);
    this.objectType = object.constructor.name;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = 'soak-form';
    options.classes = ['mc3e'];
    options.title = 'Area Soak';
    options.template = 'systems/mc3e/templates/apps/morale-cover.html';
    options.width = '300px';
    options.height = 'auto';
    return options;
  }

  async _updateObject(event, formData) {
    formData.id = this.object.id;
    return canvas.scene.updateEmbeddedEntity(this.objectType, formData);
  }
}
