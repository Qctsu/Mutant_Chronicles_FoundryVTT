// A form used to add and remove items from transportation items that have
// stowage and their own encumbrance limits.
//
export default class StowItem extends FormApplication {
  constructor(object, options) {
    super(object, options);

    this.originalContainer = object.item.system.stowedIn;
    this.selectedContainer = object.item.system.stowedIn;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'transport-stowage',
      classes: ['mc3e', 'item', 'sheet'],
      template: 'systems/mc3e/templates/actors/stow-item.html',
      width: 'auto',
    });
  }

  get title() {
    return `${game.i18n.localize('MUTANT.stowItemTitle')}`;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.stow-item').change(event => {
      this.selectedContainer = event.target.value;
    });

    html.find('.stow-item-save').click(event => this._onSave(event));

    html.find('.stow-item-cancel').click(event => this._onCancel(event));
  }

  getData() {
    const data = {
      itemName: this.object.item.name,
      stowedIn: this.object.item.system.stowedIn,
      containers: [
        {
          id: '',
          name: '',
        },
      ],
    };

    const transports = this.object.context.inventory.transportation;

    for (let i = 0; i < transports.items.length; i++) {
      data.containers.push(transports.items[i]);
    }

    return data;
  }

  _onCancel() {
    this.close();
  }

  _onSave() {
    if (this.selectedContainer !== this.originalContainer) {
      const quantity = this.object.item.system.quantity || 1;

      let itemEncumbrance = parseInt(this.object.item.system.encumbrance) || 0;

      itemEncumbrance *= quantity;

      // remove stowage value from original container
      if (this.originalContainer !== '') {
        let originalStowageValue = this.object.actor.getEmbeddedDocument(
          'Item',
          this.originalContainer
        ).system.stowage.value;

        let newStowage = originalStowageValue - itemEncumbrance;
        newStowage = newStowage < 0 ? 0 : newStowage;

        this.object.actor.updateEmbeddedDocuments('Item', [
          {
            _id: this.originalContainer,
            'system.stowage.value': newStowage,
          },
        ]);
      }
      // add stowage value to new container
      if (this.selectedContainer !== '') {
        let originalStowageValue = this.object.actor.getEmbeddedDocument(
          'Item',
          this.selectedContainer
        ).system.stowage.value;

        let newStowage = originalStowageValue + itemEncumbrance;

        this.object.actor.updateEmbeddedDocuments('Item', [
          {
            _id: this.selectedContainer,
            'system.stowage.value': newStowage,
          },
        ]);
      }

      this.object.actor.updateEmbeddedDocuments('Item', [
        {
          _id: this.object.item._id,
          'system.equipped': false,
          'system.stowedIn': this.selectedContainer,
        },
      ]);
    }

    this.close();
  }
}
