/**
 * API 客戶端
 * 集中管理所有 API 請求
 */

class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  /**
   * 通用 fetch 方法
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    const payload = await response.json();
    if (!payload.ok) {
      throw new Error(payload.message || '內容格式錯誤');
    }

    return payload.data;
  }

  /**
   * 取得章節索引
   */
  async getEpisodeIndex() {
    return this.request('/episodes');
  }

  /**
   * 取得指定章節
   */
  async getEpisode(slug) {
    return this.request(`/episodes/${slug}`);
  }

  /**
   * 取得成員列表
   */
  async getMembers() {
    const data = await this.request('/members');
    return data.members || [];
  }

  /**
   * 取得活動列表
   */
  async getEvents() {
    const data = await this.request('/events');
    return data.events || [];
  }

  /**
   * 取得車站資料
   */
  async getStations() {
    const data = await this.request('/stations');
    return data.stations || [];
  }
}

export default new APIClient();
