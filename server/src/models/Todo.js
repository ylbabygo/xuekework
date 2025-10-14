const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TodoList {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.description = data.description;
    this.color = data.color;
    this.is_archived = data.is_archived;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建新待办清单
  static async create(listData) {
    const {
      user_id,
      name,
      description = '',
      color = '#3B82F6'
    } = listData;

    const id = uuidv4();
    const sql = `
      INSERT INTO todo_lists (id, user_id, name, description, color)
      VALUES (?, ?, ?, ?, ?)
    `;

    await query(sql, [id, user_id, name, description, color]);
    return await this.findById(id);
  }

  // 根据ID查找待办清单
  static async findById(id) {
    const sql = 'SELECT * FROM todo_lists WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? new TodoList(rows[0]) : null;
  }

  // 获取用户的待办清单列表
  static async getByUser(userId, includeArchived = false) {
    let sql = 'SELECT * FROM todo_lists WHERE user_id = ?';
    const params = [userId];

    if (!includeArchived) {
      sql += ' AND is_archived = FALSE';
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return rows.map(row => new TodoList(row));
  }

  // 更新待办清单
  async update(updateData) {
    const allowedFields = ['name', 'description', 'color'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(this.id);
    const sql = `UPDATE todo_lists SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await query(sql, values);
    
    // 重新获取更新后的清单信息
    const updatedList = await TodoList.findById(this.id);
    Object.assign(this, updatedList);
    
    return this;
  }

  // 归档清单
  async archive() {
    const sql = 'UPDATE todo_lists SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_archived = true;
    return this;
  }

  // 取消归档
  async unarchive() {
    const sql = 'UPDATE todo_lists SET is_archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_archived = false;
    return this;
  }

  // 删除清单（级联删除所有待办事项）
  async delete() {
    return await transaction(async (connection) => {
      // 删除所有待办事项
      await connection.execute('DELETE FROM todo_items WHERE list_id = ?', [this.id]);
      // 删除清单
      await connection.execute('DELETE FROM todo_lists WHERE id = ?', [this.id]);
      return true;
    });
  }

  // 获取清单统计信息
  async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed_items,
        SUM(CASE WHEN is_completed = FALSE THEN 1 ELSE 0 END) as pending_items,
        SUM(CASE WHEN is_completed = FALSE AND due_date < NOW() THEN 1 ELSE 0 END) as overdue_items
      FROM todo_items 
      WHERE list_id = ?
    `;
    
    const [result] = await query(sql, [this.id]);
    return result;
  }

  // 检查用户是否有访问权限
  canAccess(userId) {
    return this.user_id === userId;
  }
}

class TodoItem {
  constructor(data) {
    this.id = data.id;
    this.list_id = data.list_id;
    this.title = data.title;
    this.description = data.description;
    this.is_completed = data.is_completed;
    this.priority = data.priority;
    this.due_date = data.due_date;
    this.completed_at = data.completed_at;
    this.sort_order = data.sort_order;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建新待办事项
  static async create(itemData) {
    const {
      list_id,
      title,
      description = '',
      priority = 'medium',
      due_date = null
    } = itemData;

    // 获取下一个排序序号
    const [maxOrder] = await query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM todo_items WHERE list_id = ?',
      [list_id]
    );

    const id = uuidv4();
    const sql = `
      INSERT INTO todo_items (id, list_id, title, description, priority, due_date, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id, list_id, title, description, priority, due_date, maxOrder.next_order
    ]);

    return await this.findById(id);
  }

  // 根据ID查找待办事项
  static async findById(id) {
    const sql = 'SELECT * FROM todo_items WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? new TodoItem(rows[0]) : null;
  }

  // 获取清单的待办事项列表
  static async getByList(listId, options = {}) {
    const {
      include_completed = true,
      sort_by = 'sort_order',
      sort_order = 'ASC'
    } = options;

    let sql = 'SELECT * FROM todo_items WHERE list_id = ?';
    const params = [listId];

    if (!include_completed) {
      sql += ' AND is_completed = FALSE';
    }

    // 排序
    const validSortFields = ['sort_order', 'created_at', 'updated_at', 'due_date', 'priority'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'sort_order';
    const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // 优先级排序特殊处理
    if (sortField === 'priority') {
      sql += ` ORDER BY FIELD(priority, 'urgent', 'high', 'medium', 'low') ${sortDirection}`;
    } else {
      sql += ` ORDER BY ${sortField} ${sortDirection}`;
    }

    const rows = await query(sql, params);
    return rows.map(row => new TodoItem(row));
  }

  // 获取用户的所有待办事项
  static async getByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 50,
      include_completed = false,
      priority = '',
      due_soon = false,
      overdue = false
    } = options;

    let sql = `
      SELECT ti.*, tl.name as list_name, tl.color as list_color
      FROM todo_items ti
      JOIN todo_lists tl ON ti.list_id = tl.id
      WHERE tl.user_id = ? AND tl.is_archived = FALSE
    `;
    const params = [userId];

    if (!include_completed) {
      sql += ' AND ti.is_completed = FALSE';
    }

    if (priority) {
      sql += ' AND ti.priority = ?';
      params.push(priority);
    }

    if (due_soon) {
      sql += ' AND ti.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)';
    }

    if (overdue) {
      sql += ' AND ti.due_date < NOW() AND ti.is_completed = FALSE';
    }

    // 获取总数
    const countSql = sql.replace('SELECT ti.*, tl.name as list_name, tl.color as list_color', 'SELECT COUNT(*) as total');
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    // 排序和分页
    sql += ' ORDER BY ti.is_completed ASC, FIELD(ti.priority, "urgent", "high", "medium", "low"), ti.due_date ASC, ti.sort_order ASC';
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    const items = rows.map(row => {
      const item = new TodoItem(row);
      item.list_name = row.list_name;
      item.list_color = row.list_color;
      return item;
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新待办事项
  async update(updateData) {
    const allowedFields = ['title', 'description', 'priority', 'due_date'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(this.id);
    const sql = `UPDATE todo_items SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await query(sql, values);
    
    // 重新获取更新后的事项信息
    const updatedItem = await TodoItem.findById(this.id);
    Object.assign(this, updatedItem);
    
    return this;
  }

  // 切换完成状态
  async toggleComplete() {
    const newCompletedState = !this.is_completed;
    const completedAt = newCompletedState ? new Date() : null;
    
    const sql = `
      UPDATE todo_items 
      SET is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await query(sql, [newCompletedState, completedAt, this.id]);
    
    this.is_completed = newCompletedState;
    this.completed_at = completedAt;
    
    return this;
  }

  // 更新排序顺序
  async updateSortOrder(newOrder) {
    const sql = 'UPDATE todo_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [newOrder, this.id]);
    this.sort_order = newOrder;
    return this;
  }

  // 移动到其他清单
  async moveToList(newListId) {
    // 获取目标清单的下一个排序序号
    const [maxOrder] = await query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM todo_items WHERE list_id = ?',
      [newListId]
    );

    const sql = `
      UPDATE todo_items 
      SET list_id = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await query(sql, [newListId, maxOrder.next_order, this.id]);
    
    this.list_id = newListId;
    this.sort_order = maxOrder.next_order;
    
    return this;
  }

  // 删除待办事项
  async delete() {
    const sql = 'DELETE FROM todo_items WHERE id = ?';
    await query(sql, [this.id]);
    return true;
  }

  // 批量更新排序顺序
  static async batchUpdateSortOrder(updates) {
    return await transaction(async (connection) => {
      for (const { id, sort_order } of updates) {
        await connection.execute(
          'UPDATE todo_items SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [sort_order, id]
        );
      }
      return updates.length;
    });
  }

  // 批量完成/取消完成
  static async batchToggleComplete(itemIds, completed = true) {
    const completedAt = completed ? new Date() : null;
    const placeholders = itemIds.map(() => '?').join(',');
    
    const sql = `
      UPDATE todo_items 
      SET is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `;
    
    const result = await query(sql, [completed, completedAt, ...itemIds]);
    return result.affectedRows;
  }

  // 获取即将到期的待办事项
  static async getDueSoon(userId, days = 7) {
    const sql = `
      SELECT ti.*, tl.name as list_name, tl.color as list_color
      FROM todo_items ti
      JOIN todo_lists tl ON ti.list_id = tl.id
      WHERE tl.user_id = ? 
      AND ti.is_completed = FALSE 
      AND ti.due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY ti.due_date ASC
    `;
    
    const rows = await query(sql, [userId, days]);
    return rows.map(row => {
      const item = new TodoItem(row);
      item.list_name = row.list_name;
      item.list_color = row.list_color;
      return item;
    });
  }

  // 获取逾期的待办事项
  static async getOverdue(userId) {
    const sql = `
      SELECT ti.*, tl.name as list_name, tl.color as list_color
      FROM todo_items ti
      JOIN todo_lists tl ON ti.list_id = tl.id
      WHERE tl.user_id = ? 
      AND ti.is_completed = FALSE 
      AND ti.due_date < NOW()
      ORDER BY ti.due_date ASC
    `;
    
    const rows = await query(sql, [userId]);
    return rows.map(row => {
      const item = new TodoItem(row);
      item.list_name = row.list_name;
      item.list_color = row.list_color;
      return item;
    });
  }

  // 检查是否逾期
  isOverdue() {
    return this.due_date && new Date(this.due_date) < new Date() && !this.is_completed;
  }

  // 检查是否即将到期
  isDueSoon(days = 7) {
    if (!this.due_date || this.is_completed) return false;
    
    const dueDate = new Date(this.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= days;
  }
}

module.exports = { TodoList, TodoItem };