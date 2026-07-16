/* global wp */
/**
 * Remove some of the embed options from the blocks list
 *
 * @link https://wordpress.stackexchange.com/a/379613/1756
 */
wp.domReady(() => {
  const allowedEmbedBlocks = [
    'vimeo',
    'youtube'
  ];
  wp.blocks.getBlockVariations('core/embed').forEach((blockVariation) => {
    if (allowedEmbedBlocks.indexOf(blockVariation.name) === -1) {
      wp.blocks.unregisterBlockVariation('core/embed', blockVariation.name);
    }
  });
});



wp.domReady(() => {
  // wp.blocks.registerBlockStyle('core/group', [
  //   {
  //     name: 'rubbing',
  //     label: 'Text Rub Background'
  //   },
  //   {
  //     name: 'woodgrain',
  //     label: 'Woodgrain Background',
  //     isDefault: true
  //   }
  // ]);

  // wp.blocks.registerBlockStyle('acf/text-circle', [
  //   {
  //     name: 'rubbing01',
  //     label: 'Rubbing 01',
  //     isDefault: true
  //   },
  //   {
  //     name: 'ledger01',
  //     label: 'Ledger 01'
  //   },
  //   {
  //     name: 'ledger02',
  //     label: 'Ledger 02'
  //   }
  // ]);
});
