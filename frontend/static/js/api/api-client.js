class APIClient {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

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

  async getEpisodeIndex() {
    return this.request('/episodes');
  }

  async getEpisode(slug) {
    return this.request(`/episodes/${slug}`);
  }

  async getMembers() {
    const data = await this.request('/members');
    return data.members || [];
  }

  async getEvents() {
    const data = await this.request('/events');
    return data.events || [];
  }

  async getStations() {
    const data = await this.request('/stations');
    return data.stations || [];
  }
}

export default new APIClient();
