"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _utils = require("../../common/utils");

var _reactDom = require("react-dom");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Grid mixin, responsible for row statuses processing
 */
var GridStatusesMixin = {
  /**
   * Add record status
   *
   * @param {*}    recordId    Record ID
   * @param {string}           status      Record status
   */
  addRecordStatus: function addRecordStatus(recordId, status) {
    var row = (0, _utils.toEncodedString)(recordId); // If list does not contain the record, mark its status as empty

    if (!this.state.statuses.hasOwnProperty(row)) {
      this.state.statuses[row] = {
        id: recordId,
        sum: 0
      };
    }

    this.state.statuses[row].sum |= this._getStatusBit(status);
    var elem = (0, _reactDom.findDOMNode)(this.body).querySelector("tr[key=\"".concat(row, "\"]"));

    if (elem) {
      elem.classList.add(status);
    } else {
      this.updateTable();
    }
  },

  /**
   * Add status to records group
   *
   * @param {Array}      recordIds   Record IDs array
   * @param {string}     status      Status
   */
  addRecordStatusGroup: function addRecordStatusGroup(recordIds, status) {
    var bit = this._getStatusBit(status);

    var needTableUpdate;

    var _iterator = _createForOfIteratorHelper(recordIds),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var id = _step.value;
        var row = (0, _utils.toEncodedString)(id);

        if (!this.state.statuses.hasOwnProperty(row)) {
          this.state.statuses[row] = {
            id: id,
            sum: 0
          };
        }

        this.state.statuses[row].sum |= bit;

        if (this.state.data[row]) {
          this._updateRow(row);

          continue;
        }

        needTableUpdate = true;
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    if (needTableUpdate) {
      this.updateTable();
    }
  },

  /**
   * Remove record status
   *
   * @param {*}       recordId    Record ID
   * @param {string}  status      Record status
   */
  removeRecordStatus: function removeRecordStatus(recordId, status) {
    var bit = this._getStatusBit(status);

    var rowId = (0, _utils.toEncodedString)(recordId); // Cancel method execution if record has no statuses

    if (!this.state.statuses[rowId]) {
      return;
    } // Remove status if record has it


    if (this.state.statuses[rowId].sum & bit) {
      this.state.statuses[rowId].sum ^= bit;

      if (!this.state.statuses[rowId].sum) {
        // Remove table record if it's extra
        if (!this._isMainRow(rowId)) {
          this._removeRecord(rowId);
        }

        delete this.state.statuses[rowId];
      }
    } // Remove element's class


    var elem = (0, _reactDom.findDOMNode)(this.body).querySelector("tr[key=\"".concat(rowId, "\"]"));

    if (elem) {
      elem.classList.remove(status);
    }
  },

  /**
   * Check record status presence
   *
   * @param   {*}       recordId    Record ID
   * @param   {number}  status      Record status
   * @returns {boolean} Record has status flag
   */
  hasRecordStatus: function hasRecordStatus(recordId, status) {
    var row = (0, _utils.toEncodedString)(recordId);

    if (this.state.statuses[row]) {
      return (this.state.statuses[row].sum & this._getStatusBit(status)) > 0;
    }

    return false;
  },

  /**
   * Get all record IDs that have the status
   *
   * @param {number}  status  Status
   * @returns {Array} Record IDs array
   */
  getAllWithStatus: function getAllWithStatus(status) {
    var i;
    var records = [];

    var bit = this._getStatusBit(status);

    for (i in this.state.statuses) {
      if (this.state.statuses[i].sum & bit) {
        records.push(this.state.statuses[i].id);
      }
    }

    return records;
  },

  /**
   * Remove records status
   *
   * @param {string}      status  Status
   */
  removeRecordStatusAll: function removeRecordStatusAll(status) {
    var i;

    var bit = this._getStatusBit(status);

    for (i in this.state.statuses) {
      if (this.state.statuses[i].sum & bit) {
        this.state.statuses[i].sum ^= bit;
      }

      if (!this.state.statuses[i].sum) {
        if (!this._isMainRow(i) && !this._isChanged(i)) {
          this._removeRecord(i);
        }

        delete this.state.statuses[i];
      }
    }

    var elem = (0, _reactDom.findDOMNode)(this.body).querySelector(".dgrid-body tr.".concat(status));

    if (elem) {
      elem.classList.remove(status);
    }
  },

  /**
   * Get all status names that are applied to the row
   *
   * @param   {string}    row    Row ID
   * @return  {Array}  Status names array
   * @private
   */
  _getRowStatusNames: function _getRowStatusNames(row) {
    var names = [];
    var statuses = this.state.statuses[row] && this.state.statuses[row].sum;

    if (!statuses) {
      return [];
    }

    for (var i in this.state.statusMap) {
      if (statuses & this.state.statusMap[i]) {
        names.push(i);
      }
    }

    return names;
  },

  /**
   * Get status as a bit using its text name
   *
   * @param       {string}    statusName  Status name
   * @return      {number}    Bit
   * @private
   */
  _getStatusBit: function _getStatusBit(statusName) {
    var status;
    var offset;

    if (this.state.statusMap.hasOwnProperty(statusName)) {
      status = this.state.statusMap[statusName];
    } else {
      // TODO offset stored in the state, I remove the utils.size
      offset = (0, _utils.size)(this.state.statusMap);

      if (offset > 30) {
        throw Error('Status quantity exceeds 30');
      }

      status = this.state.statusMap[statusName] = 1 << offset;
    }

    return status;
  },

  /**
   * Get record IDs that have a status
   *
   * @return {Array}
   * @private
   */
  _getRecordsWithStatus: function _getRecordsWithStatus() {
    var ids = [];
    var i;

    for (i in this.state.statuses) {
      ids.push(this.state.statuses[i].id);
    }

    return ids;
  }
};
var _default = GridStatusesMixin;
exports["default"] = _default;
module.exports = exports.default;