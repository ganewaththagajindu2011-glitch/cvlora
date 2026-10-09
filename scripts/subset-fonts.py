"""Optional font regeneration: fonttools[woff]==4.61.1; run after pnpm install.
Original OFL notices are retained. Modified font names honor reserved names.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root = Path(__file__).resolve().parents[1]
destination = root / 'apps/web/src/assets/fonts'
destination.mkdir(parents=True, exist_ok=True)
for original, family, output in [('inter', 'CVLora Text', 'text'), ('outfit', 'CVLora Display', 'display')]:
    source = root / 'apps/web/node_modules/@fontsource-variable' / original
    font = TTFont(source / 'files' / f'{original}-latin-wght-normal.woff2')
    instantiateVariableFont(font, {'wght': (400, 700)}, inplace=True)
    options = subset.Options()
    options.flavor = 'woff2'
    options.layout_features = ['kern', 'liga', 'clig']
    options.name_IDs = ['*']
    options.name_legacy = True
    options.name_languages = ['*']
    tool = subset.Subsetter(options=options)
    tool.populate(unicodes=list(range(32, 127)) + [0x00A9, 0x00A0] + list(range(0x2010, 0x2027)))
    tool.subset(font)
    for name in font['name'].names:
        if name.nameID in (1, 3, 4, 6, 16, 21, 25):
            value = name.toUnicode().replace(original.title(), family)
            if name.nameID in (6, 25):
                value = value.replace(' ', '')
            name.string = value.encode(name.getEncoding())
    font.flavor = 'woff2'
    font.save(destination / f'{output}.woff2')
    (destination / f'{output}-LICENSE.txt').write_bytes((source / 'LICENSE').read_bytes())
    print(output, (destination / f'{output}.woff2').stat().st_size, 'bytes')
