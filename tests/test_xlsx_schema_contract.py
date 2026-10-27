"""Optional, dependency-isolated Draft 2020-12 QA for the XLSX V0 wire schema.

Usage: python -m unittest discover -s tests -p 'test_xlsx_schema_contract.py'
Requires the development-only open-source `jsonschema` package, not the SMAX runtime.
Native extractor and original-byte parity remain covered by xlsx-preflight.test.mjs.
"""
import copy
import json
import unittest
from pathlib import Path

try:
    from jsonschema import Draft202012Validator
except ImportError:
    Draft202012Validator = None

SCHEMA_FILE = Path(__file__).resolve().parents[1] / 'preprocessing' / 'SMAX_PREPROCESS_XLSX_CELLS_V0.schema.json'


def fixture():
    return {
        'schema_version': 'SMAX_PREPROCESS_XLSX_CELLS_V0',
        'source': {'format': 'XLSX_ZIP', 'sha256': '0' * 64, 'bytes': 128,
                   'worksheet_paths': ['xl/worksheets/sheet1.xml']},
        'sheets': [{'source_path': 'xl/worksheets/sheet1.xml',
                    'rows': [{'source_row': 1, 'cells': [
                        {'ref': 'A1', 'kind': 'number_text', 'value': '-12.50',
                         'formula': None, 'status': 'READY_FOR_HUMAN_REVIEW', 'reason': None},
                        {'ref': 'B1', 'kind': 'blank', 'value': None,
                         'formula': 'SUM(A2)', 'status': 'NEEDS_REVIEW',
                         'reason': 'FORMULA_UNEVALUATED'}]}]}],
        'quality': {'sheets': 1, 'rows': 1, 'cells': 2, 'review_cells': 1},
        'processing_mode': 'DETERMINISTIC_LOCAL', 'approval': 'NOT_GRANTED'
    }


@unittest.skipIf(Draft202012Validator is None, 'optional jsonschema dependency unavailable')
class XlsxSchemaContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.schema = json.loads(SCHEMA_FILE.read_text(encoding='utf-8'))
        Draft202012Validator.check_schema(cls.schema)
        cls.validator = Draft202012Validator(cls.schema)

    def test_valid_package(self):
        self.assertTrue(self.validator.is_valid(fixture()))

    def test_approval_and_extra_properties_denied(self):
        for change in [lambda p: p.update(approval='APPROVED'),
                       lambda p: p.update(extraneous='value')]:
            pkg = fixture()
            change(pkg)
            self.assertFalse(self.validator.is_valid(pkg))

    def test_formula_requires_review_without_cached_values(self):
        for change in [lambda c: c.update(value='123'),
                       lambda c: c.update(reason=None),
                       lambda c: c.update(status='APPROVED')]:
            pkg = fixture()
            change(pkg['sheets'][0]['rows'][0]['cells'][1])
            self.assertFalse(self.validator.is_valid(pkg))

    def test_numeric_literals_are_strict_but_lossless(self):
        for number in ['0', '-12.50', '+.5', '1.', '2e-30', '100000000000000000000.5']:
            pkg = fixture()
            pkg['sheets'][0]['rows'][0]['cells'][0]['value'] = number
            self.assertTrue(self.validator.is_valid(pkg), number)
        for number in ['NaN', 'Infinity', '=SUM(1)', '+cmd', '1,000', ' 2 ', '1e']:
            pkg = fixture()
            pkg['sheets'][0]['rows'][0]['cells'][0]['value'] = number
            self.assertFalse(self.validator.is_valid(pkg), number)

    def test_source_path_and_type_bounds(self):
        for change in [lambda p: p['source'].update(worksheet_paths=['../sheet1.xml']),
                       lambda p: p['quality'].update(rows=-1),
                       lambda p: p['sheets'][0]['rows'][0]['cells'][0].update(value=True)]:
            pkg = fixture()
            change(pkg)
            self.assertFalse(self.validator.is_valid(pkg))


if __name__ == '__main__':
    unittest.main()
